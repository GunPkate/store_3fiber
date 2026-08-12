import { center_btn, glass_bg, icon_btn, icon_btn_active, toolbar_row, toolbar_wrap } from "../../../config/uimenu/uimenu";
import { useUIStore } from '../../../service/state/uiState';
import { DocsBar } from "../sections/DocsBar";
import './DocsHUD.css'

export default function DocHUD() {
    
    const activeScene = useUIStore((s) => s.activeScene);
    const setActiveScene = useUIStore((s) => s.setActiveScene);

    return (<>
        <DocsBar/>

         <div id="toolbar" className={toolbar_wrap+glass_bg}>
            <div className={toolbar_row}>
                 <div className={center_btn}>
                    <button
                        title={activeScene === 'docs' ? 'Back to Store' : 'Docs'}
                        aria-label={activeScene === 'docs' ? 'Back to Store' : 'Docs'}
                        className={`${icon_btn}${activeScene === 'docs' ? ` ${icon_btn_active}` : ''}`}
                        onClick={() => setActiveScene(activeScene === 'docs' ? 'sim' : 'docs')}
                        >
                        📘
                    </button>
                    <label>Docs</label>
                </div>
            </div>
         </div>
    </>)
}