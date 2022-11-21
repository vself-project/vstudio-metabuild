import { FC, memo } from 'react';
import { faLinkedin, faTwitter, faTelegram } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import footerStyles from './index.module.scss';

const Footer: FC = memo(() => {
    return (
        <div className={footerStyles.footer}>
            <div className={footerStyles.footer_container}>
                <div className={footerStyles.social_icons_container}>
                    <FontAwesomeIcon icon={faTelegram} />
                    <FontAwesomeIcon icon={faTwitter} />
                    <FontAwesomeIcon icon={faLinkedin} />

                    <div className={footerStyles.powered_text}>Powered by vSelf</div>
                </div>
            </div>
        </div>
    );
});

Footer.displayName = 'Footer';
export default Footer;