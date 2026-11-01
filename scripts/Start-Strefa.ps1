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

function Update-Strefa {
    $gitRoot = & git.exe rev-parse --show-toplevel
    if ($LASTEXITCODE -ne 0) { throw 'Ten folder nie jest repozytorium Git. Uzyj folderu strefa-aktualna pobranego przez git clone.' }
    if ([IO.Path]::GetFullPath($gitRoot.Trim()) -ne $root) { throw 'Uruchom plik z glownego folderu STREFY.' }
    $branch = & git.exe branch --show-current
    if ($LASTEXITCODE -ne 0 -or $branch -ne 'main') { throw 'Wymagana galaz main. Nie przelaczam galezi automatycznie; pokaz ten komunikat w czacie.' }
    $changes = & git.exe status --porcelain --untracked-files=all
    if ($LASTEXITCODE -ne 0) { throw 'Nie mozna sprawdzic lokalnych zmian.' }
    if ($changes) { throw 'Masz lokalne zmiany lub dodatkowe pliki w repozytorium. Nie zostaly nadpisane. Pokaz wynik git status w czacie.' }

    # Check the LAN listener and localhost before replacing dependencies.
    $addresses = @([Net.IPAddress]::Any)
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

}

function Start-StrefaServer {
    # Redirect only stdin so Vite cannot consume the launcher's Ctrl+C key.
    # stdout/stderr still appear in this window. Run Node directly: no nested CMD.
    $process = [Diagnostics.Process]::new()
    $process.StartInfo.FileName = (Get-Command 'node.exe').Source
    $vitePath = Join-Path $root 'node_modules\vite\bin\vite.js'
    if (-not (Test-Path -LiteralPath $vitePath)) { throw 'Brakuje Vite po instalacji zaleznosci.' }
    $process.StartInfo.Arguments = '"' + $vitePath + '" --host 0.0.0.0 --port 5173 --strictPort --open http://localhost:5173'
    $process.StartInfo.WorkingDirectory = $root
    $process.StartInfo.UseShellExecute = $false
    $process.StartInfo.RedirectStandardInput = $true
    $started = $false
    $oldControlMode = [Console]::TreatControlCAsInput
    $stoppedByUser = $false
    try {
        [Console]::TreatControlCAsInput = $true
        Write-Host "`n[3/3] Uruchamianie gry..." -ForegroundColor Green
        Write-Host 'Komputer: http://localhost:5173 (dotychczasowy zapis).'
        Write-Host 'Telefon w tym samym Wi-Fi: otworz adres Network wypisany ponizej przez Vite.'
        Write-Host 'Jesli Windows zapyta o zapore, zezwol Node.js na dostep w sieci prywatnej.'
        Write-Host 'Telefon ma osobny zapis. Komputer musi pozostac wlaczony.'
        Write-Host 'Zostaw to okno otwarte. Ctrl+C zatrzymuje gre i otwiera menu.'
        $started = $process.Start()
        if (-not $started) { throw 'Nie udalo sie uruchomic serwera.' }
        $process.StandardInput.Close()
        while (-not $process.HasExited) {
            if ([Console]::KeyAvailable) {
                $key = [Console]::ReadKey($true)
                if ($key.Key -eq [ConsoleKey]::C -and ($key.Modifiers -band [ConsoleModifiers]::Control)) {
                    $stoppedByUser = $true
                    break
                }
            }
            Start-Sleep -Milliseconds 100
        }
        if (-not $stoppedByUser -and $process.ExitCode -ne 0) {
            throw "Serwer zakonczyl sie bledem (kod $($process.ExitCode)). Sprawdz komunikat powyzej."
        }
    } finally {
        try {
            if ($started -and -not $process.HasExited) {
                # Kill only this owned server and its child processes, never by name/port.
                & taskkill.exe /PID $process.Id /T /F
                if ($LASTEXITCODE -ne 0 -and -not $process.HasExited) {
                    throw 'Nie udalo sie zatrzymac serwera. Zamknij to okno przed ponownym uruchomieniem.'
                }
                $process.WaitForExit()
            }
        } finally {
            [Console]::TreatControlCAsInput = $oldControlMode
            $process.Dispose()
        }
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


    while ($true) {
        try {
            Update-Strefa
            Start-StrefaServer
        } catch {
            Write-Host "`nZatrzymano: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host 'Nie usuwaj plikow ani lokalnych zmian. W razie problemu skopiuj komunikat do czatu.'
        }
        do {
            Write-Host "`nSTREFA - co dalej?" -ForegroundColor Yellow
            Write-Host '[U] Aktualizuj i uruchom ponownie'
            Write-Host '[Z] Zamknij'
            $choice = (Read-Host 'Wpisz U lub Z i nacisnij Enter').Trim().ToUpperInvariant()
        } while ($choice -ne 'U' -and $choice -ne 'Z')
        if ($choice -eq 'Z') { break }
    }
} catch {
    $exitCode = 1
    Write-Host "`nZatrzymano: $($_.Exception.Message)" -ForegroundColor Red
    [void](Read-Host 'Nacisnij Enter, aby zamknac okno')
} finally {
    if ($null -ne $lock) { $lock.Dispose() }
}
exit $exitCode
