/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Footer microcomponent for displaying privacy policy, terms & conditions links and app version
 * @param {Object} props - Component props
 * @param {Function} props.onPrivacyClick - Handler for privacy policy link click
 * @param {Function} props.onTermsClick - Handler for terms & conditions link click
 * @param {Object} props.translations - Translation object containing link texts
 * @param {string} [props.appVersion] - Optional app version to display
 */
export const Footer = ({ onPrivacyClick, onTermsClick, translations, appVersion }) => {
    return (
        <footer className="menu-footer">
            <div>
                <button
                    className="link-button"
                    onClick={onPrivacyClick}
                    aria-label={translations?.privacyPolicy?.linkText || 'Privacy Policy'}
                >
                    {translations?.privacyPolicy?.linkText || 'Privacy Policy'}
                </button>
                <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
                <button
                    className="link-button"
                    onClick={onTermsClick}
                    aria-label={translations?.termsAndConditions?.linkText || 'Terms & Conditions'}
                >
                    {translations?.termsAndConditions?.linkText || 'Terms & Conditions'}
                </button>
            </div>
            {appVersion && (
                <div className="app-version">
                    v{appVersion}
                </div>
            )}
        </footer>
    );
};