import { useId } from 'react';

// Local vector illustrations: no icon fonts, remote assets or tracking requests.
export function ItemArt({ itemId }: { itemId: string }) {
  const id = useId().replace(/:/g, '');
  const fill = `url(#${id})`;
  return <svg className="item-art" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
    <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop stopColor={itemId.includes('water') ? '#b7cfbb' : '#d4bb87'} /><stop offset=".5" stopColor={itemId.includes('water') ? '#597e70' : '#8b8056'} /><stop offset="1" stopColor="#343c30" /></linearGradient></defs>
    <ellipse cx="60" cy="102" rx="35" ry="6" fill="#000" opacity=".24" />
    <g stroke="#232820" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
      {itemId === 'backpack' && <>
        <path d="M40 30V22Q60 9 80 22V31" fill="none" stroke="#b8a679" strokeWidth="7" />
        <path d="M30 43L21 49 19 91 31 96M89 43L99 49 101 91 89 96" fill="#6b6948" />
        <path d="M33 27Q60 17 87 30L92 91Q89 102 60 104L29 96Z" fill={fill} />
        <path d="M32 31Q60 24 88 33L85 56Q59 64 32 52Z" fill="#85835b" />
        <path d="M43 35L42 71M76 36L77 71" stroke="#453f2d" strokeWidth="7" />
        <path d="M38 70Q59 64 83 72L82 94 38 92Z" fill="#9b8f62" />
        <path d="M48 48H55V58H48ZM70 48H77V58H70Z" fill="#c4b279" />
        <path d="M42 76L76 78M40 85L70 87" stroke="#b4a579" strokeWidth="1" />
      </>}
      {(itemId === 'water' || itemId === 'raw-water') && <g transform="rotate(12 60 60)">
        <path d="M46 17H74V31L84 44V94Q60 109 36 94V44L46 31Z" fill={fill} />
        <path d="M47 15H73V27H47Z" fill="#6e7354" />
        <path d="M39 56Q61 62 81 55V91Q61 101 39 91Z" fill={itemId === 'water' ? '#5e9d98' : '#858151'} opacity=".8" />
        <path d="M38 60L82 62 80 79 39 77Z" fill="#d0c5a1" />
        <path d="M61 64Q48 77 61 77Q71 76 61 64Z" fill={itemId === 'water' ? '#3c7472' : '#77704d'} stroke="none" />
        <path d="M44 40V51M44 83V90" stroke="#d4e1cf" strokeWidth="3" />
      </g>}
      {itemId === 'ration' && <g transform="rotate(-12 60 60)">
        <path d="M28 29L87 22 96 88 35 99Z" fill={fill} />
        <path d="M29 29L88 23 87 33 32 40ZM35 89L94 80 96 88 35 99Z" fill="#6f694a" />
        <path d="M35 48L83 42 87 72 39 81Z" fill="#d3c69e" />
        <path d="M52 56L72 54 74 64 54 66Z" fill="#8a6c43" />
        <path d="M44 73L78 68" stroke="#827753" strokeWidth="2" />
      </g>}
      {itemId === 'bandage' && <>
        <path d="M23 49L75 32Q105 30 103 58L92 84 38 96Z" fill="#d4cbb2" />
        <path d="M30 51L82 36M28 61L80 45M29 72L77 57M34 83L76 68" fill="none" stroke="#a49e84" strokeWidth="2" />
        <ellipse cx="81" cy="62" rx="22" ry="28" fill="#e0d7bc" transform="rotate(24 81 62)" />
        <ellipse cx="81" cy="62" rx="10" ry="16" fill="#9a9277" transform="rotate(24 81 62)" />
        <path d="M58 85L45 105 20 93 32 78" fill="#d4cbb2" />
      </>}
      {itemId === 'scrap' && <>
        <path d="M27 49L48 26 69 36 48 68Z" fill="#9d8060" /><path d="M42 59L83 31 97 50 60 81Z" fill="#8d9690" />
        <path d="M24 80L62 69 81 90 40 101Z" fill="#9e7852" /><path d="M74 61L96 70 87 98 65 85Z" fill="#697d72" />
        <circle cx="48" cy="84" r="6" fill="#333d34" /><path d="M51 58L79 40M33 81L48 77M80 69L87 72" stroke="#c8bea0" strokeWidth="2" />
      </>}
      {itemId === 'food' && <>
        <path d="M30 39Q58 48 85 37L96 89Q62 110 24 90Z" fill={fill} /><path d="M29 39L45 23 76 26 86 38 58 50Z" fill="#a59b69" />
        <ellipse cx="48" cy="70" rx="17" ry="13" fill="#a97c48" /><ellipse cx="73" cy="81" rx="15" ry="12" fill="#b18e52" />
        <path d="M64 48Q76 24 94 28Q83 45 64 48Z" fill="#60754c" /><path d="M41 64L51 69M67 77L77 82" stroke="#d6b979" strokeWidth="2" />
      </>}
      {itemId === 'cloth' && <>
        <path d="M21 50L78 28 101 69 44 94Z" fill="#c5ba99" /><path d="M21 50L46 65 101 45 101 69 44 94Z" fill={fill} />
        <path d="M27 57L46 72 93 53M32 66L47 79 94 61M37 76L47 86 96 68" stroke="#e1d5b0" strokeWidth="2" fill="none" />
        <path d="M46 66L43 91" stroke="#797961" strokeDasharray="2 4" />
      </>}
    </g>
  </svg>;
}
