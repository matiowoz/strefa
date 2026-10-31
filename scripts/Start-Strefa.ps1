param([Parameter(Mandatory = $true)][string]$ProjectRoot)

$ErrorActionPreference = 'Stop'
$lock = $null
$exitCode = 0

function Invoke-Checked {
    param([string]$Command, [string[]]$Arguments)
    & $Command @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "Polecenie $Command nie powiodlo sie (kod $LASTEXITCODE). Sprawdz komunikat powyzej."
    }
}

try {
    Set-Location -LiteralPath $ProjectRoot
    $root = (Get-Location).Path
    foreach ($command in @('git.exe', 'node.exe', 'npm.cmd')) {
        if (-not (Get-Command $command -ErrorAction SilentlyContinue)) {
            throw "Brakuje $command. Zainstaluj Git for Windows i Node.js 24 LTS, potem otworz plik ponownie."
        }
    }
    Invoke-Checked 'node.exe' @('-e', "const [a,b]=process.versions.node.split('.').map(Number); if(a<22||(a===22&&b<12)){console.error('Wymagany Node.js 22.12 lub nowszy; polecany 24 LTS.');process.exit(1)}")

    # A per-checkout lock prevents a second launcher from replacing dependencies
    # while the first launcher is still serving the game. No repository files used.
    $sha = [System.Security.Cryptography.SHA256]::Create()
    try {
        $hash = [BitConverter]::ToString($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($root.ToLowerInvariant()))).Replace('-', '')
    } finally { $sha.Dispose() }
    $lockPath = Join-Path ([IO.Path]::GetTempPath()) "strefa-$hash.lock"
    try {
        $lock = [IO.File]::Open($lockPath, [IO.FileMode]::OpenOrCreate, [IO.FileAccess]::ReadWrite, [IO.FileShare]::None)
    } catch { throw 'STREFA jest juz uruchomiona przez ten plik. Zamknij poprzednie okno gry przed aktualizacja.' }

    $gitRoot = & git.exe rev-parse --show-toplevel
    if ($LASTEXITCODE -ne 0) { throw 'Ten folder nie jest repozytorium Git. Uzyj folderu strefa-aktualna pobranego przez git clone.' }
    if ([IO.Path]::GetFullPath($gitRoot.Trim()) -ne $root) { throw 'Uruchom plik z glownego folderu STREFY.' }
    $branch = & git.exe branch --show-current
    if ($LASTEXITCODE -ne 0 -or $branch -ne 'main') { throw 'Wymagana galaz main. Nie przelaczam galezi automatycznie; pokaz ten komunikat w czacie.' }
    $changes = & git.exe status --porcelain --untracked-files=all
    if ($LASTEXITCODE -ne 0) { throw 'Nie mozna sprawdzic lokalnych zmian.' }
    if ($changes) { throw 'Masz lokalne zmiany lub dodatkowe pliki w repozytorium. Nie zostaly nadpisane. Pokaz wynik git status w czacie.' }

    # Check the fixed origin before replacing node_modules of a running server.
    $addresses = @([Net.IPAddress]::Loopback)
    if ([Net.Sockets.Socket]::OSSupportsIPv6) { $addresses += [Net.IPAddress]::IPv6Loopback }
    foreach ($address in $addresses) {
        $probe = [Net.Sockets.TcpListener]::new($address, 5173)
        try { $probe.Start() }
        catch { throw 'Port 5173 jest zajety. Zatrzymaj poprzednia gre przez Ctrl+C, potem uruchom plik ponownie.' }
        finally { $probe.Stop() }
    }

    Write-Host "`n[1/3] Pobieranie aktualizacji z GitHuba..." -ForegroundColor Yellow
    Invoke-Checked 'git.exe' @('fetch', 'origin', 'main')
    & git.exe merge-base --is-ancestor HEAD FETCH_HEAD
    if ($LASTEXITCODE -ne 0) { throw 'Lokalna historia rozni sie od GitHuba. Zatrzymano aktualizacje bez usuwania commitow.' }
    Invoke-Checked 'git.exe' @('merge', '--ff-only', 'FETCH_HEAD')
    # The whole PowerShell script is parsed before execution, so this update can
    # safely replace its on-disk copy. The new version is used at the next launch.
    Write-Host "`n[2/3] Instalacja zaleznosci..." -ForegroundColor Yellow
    Invoke-Checked 'npm.cmd' @('ci', '--include=optional')

    Write-Host "`n[3/3] Uruchamianie gry. Przegladarka otworzy sie po starcie." -ForegroundColor Green
    Write-Host 'Zostaw to okno otwarte. Aby zatrzymac gre, nacisnij Ctrl+C.'
    Write-Host 'Jesli port 5173 jest zajety, zatrzymaj poprzednio uruchomiony serwer.'
    Invoke-Checked 'npm.cmd' @('run', 'dev', '--', '--host', 'localhost', '--port', '5173', '--strictPort', '--open')
} catch {
    $exitCode = 1
    Write-Host "`nZatrzymano: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host 'Nie uruchamiaj kolejnych polecen na slepo. Skopiuj komunikat do czatu.'
} finally {
    if ($null -ne $lock) { $lock.Dispose() }
}
if ($exitCode -ne 0) { [void](Read-Host 'Nacisnij Enter, aby zamknac okno') }
exit $exitCode
