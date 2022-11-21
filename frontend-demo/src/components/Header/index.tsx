import { providers, utils } from "near-api-js";
import type {
    AccountView,
    CodeResult,
} from "near-api-js/lib/providers/provider";
import Link from 'next/link'
import { FC, memo, useEffect, useState, useCallback } from 'react';
import { useWalletSelector } from '../../contexts/WalletSelectorContext';
import { useContractInteractor } from "../../utils";
import { Account } from '../../data/interfaces';
import headerStyles from './index.module.scss';

const Header: FC = memo(() => {
    const { selector, modal, accounts, accountId } = useWalletSelector();
    const { handleSignIn, handleSignOut } = useContractInteractor();
    const [account, setAccount] = useState<Account | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const getAccount = useCallback(async (): Promise<Account | null> => {
        if (!accountId) {
            return null;
        }

        const { network } = selector.options;
        const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

        return provider
            .query<AccountView>({
                request_type: "view_account",
                finality: "final",
                account_id: accountId,
            })
            .then((data) => ({
                ...data,
                account_id: accountId,
            }));
    }, [accountId, selector.options]);

    useEffect(() => {
        if (!accountId) {
            return setAccount(null);
        }

        setLoading(true);

        getAccount().then((nextAccount) => {
            setAccount(nextAccount);
            setLoading(false);
        });
    }, [accountId, getAccount]);

    return (
        <div className={`${headerStyles.header}`}>
            <div className={`${headerStyles.logo_title}`}>
                <Link href="/">vStudio</Link>
            </div>

            <div className="flex items-center space-x-[15px]">
                {
                    accountId && (
                        <div className="border border-solid border-[#41F092] rounded-[20px] text-[14px] text-[#41F092] font-inter font-bold px-[15px] py-[5px]">{accountId}</div>
                    )
                }

                <button
                    className={`${accountId ? 'text-[14px] font-inter font-normal text-[#B1B1B1] underline' : headerStyles.nav_btn}`}
                    onClick={() => accountId ? handleSignOut() : handleSignIn()}
                >
                    {accountId ? "Sign out" : "Sign in"}
                </button>
            </div>
        </div>
    );
});

Header.displayName = 'Header';
export default Header;