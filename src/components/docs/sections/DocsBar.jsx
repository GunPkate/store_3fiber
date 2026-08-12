

export function DocsBar(){
    const DOC_TYPE = [ "Purchase Order", "Delivery Received", "Emp Contract"];


    return (<>
            <div id="clockbar">
                <span id="clk-day">1</span>
                <span id="clk">2</span>
                <span id="shift-lbl">3</span>
                <span style={{ color: 'rgba(255,255,255,.2)' }}>|</span>
            </div>
            <div id="clockbar-btn">
                {DOC_TYPE.map((s) => (
                    <button key={s}  onClick={() =>{} }>
                    {s}
                </button>
                ))}
            </div>
      {/* </div> */}
    </>)
}