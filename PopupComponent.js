const POPUP_COMPONENT = (function(){
    /* ===== MAIN ===== */
    class POPUP_COMPONENT {
        static render(constants, settings) {
            const replacementSettingsHtml = constants.SCHEMES.map(schemeObj => `
                <div style="display:flex;flex-direction:column;justify-content:space-between;margin-bottom:8px;">
                    <label for="${schemeObj.type}">
                        ${schemeObj.display}
                    </label>
                    <select
                        name="${schemeObj.type}"
                        value="${settings.replacementSettings[schemeObj.type]}"
                    >
                        ${schemeObj.schemes.map((scheme, index) => `
                            <option 
                            value="${index}" 
                            ${index == settings.replacementSettings[schemeObj.type] ? 'selected': ''}
                            >
                            ${scheme.display}
                            </option>
                        `)}
                    </select>
                </div>
            `).join('');

            const countSettingsHtml = `
                <label>Count: ${settings.countSettings}<label>
            `;

            document.getElementById('replacementSettings').innerHTML = replacementSettingsHtml;
            document.getElementById('countSettings').innerHTML = countSettingsHtml;
        }
    };

    return POPUP_COMPONENT;
})();