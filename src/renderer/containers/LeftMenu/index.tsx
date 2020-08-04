import React, {FC, ReactNode, useEffect} from 'react';
import {useSelector} from 'react-redux';
import noop from 'lodash/noop';

import Icon, {IconType} from '@renderer/components/Icon';
import AddAccountModal from '@renderer/containers/Account/AddAccountModal';
import AddFriendModal from '@renderer/containers/Friend/AddFriendModal';
import LeftSubmenuItem from '@renderer/containers/LeftMenu/LeftSubmenuItem';
import LeftSubmenuItemStatus from '@renderer/containers/LeftMenu/LeftSubmenuItemStatus';
import useBooleanState from '@renderer/hooks/useBooleanState';
import {getActiveBankConfig, getActivePrimaryValidatorConfig} from '@renderer/selectors';
import {useAppDispatch} from '@renderer/store';
import {getAccount} from '@renderer/store/old/accounts';
import {RootState} from '@renderer/types/store';

import LeftSubmenu from './LeftSubmenu';

import './LeftMenu.scss';

const LeftMenuSelector = (state: RootState) => {
  return {
    accounts: state.old.accounts,
    activeBank: getActiveBankConfig(state),
    activePrimaryValidator: getActivePrimaryValidatorConfig(state),
    banks: state.old.banks,
    friends: state.old.friends,
    points: state.old.points,
    validators: state.old.validators,
  };
};

const LeftMenu: FC = () => {
  const dispatch = useAppDispatch();
  const {accounts, activeBank, activePrimaryValidator, banks, friends, points, validators} = useSelector(
    LeftMenuSelector,
  );
  const [addAccountModalIsOpen, toggleAddAccountModal] = useBooleanState(false);
  const [addFriendModalIsOpen, toggleAddFriendModal] = useBooleanState(false);

  useEffect(() => {
    dispatch(getAccount());
  }, [dispatch]);

  const getAccountItems = (): ReactNode[] => {
    return accounts
      .map(({accountNumber, nickname}) => ({
        baseUrl: `/account/${accountNumber}`,
        key: accountNumber,
        label: `${nickname ? `${nickname} - ` : ''}${accountNumber}`,
        to: `/account/${accountNumber}/overview`,
      }))
      .map(({baseUrl, key, label, to}) => <LeftSubmenuItem baseUrl={baseUrl} key={key} label={label} to={to} />);
  };

  const getActiveBank = (): ReactNode => {
    if (!activeBank) return null;
    return (
      <LeftSubmenuItemStatus
        baseUrl={`/bank/${activeBank.node_identifier}`}
        key="active-bank"
        label="Your Bank (223.125.111.178)"
        status="online"
        to={`/bank/${activeBank.node_identifier}/overview`}
      />
    );
  };

  const getBankItems = (): ReactNode[] => {
    return banks
      .map(({ip_address: ipAddress, node_identifier: nodeIdentifier}) => ({
        baseUrl: `/bank/${nodeIdentifier}`,
        key: nodeIdentifier,
        label: ipAddress,
        to: `/bank/${nodeIdentifier}/overview`,
      }))
      .map(({baseUrl, key, label, to}) => (
        <LeftSubmenuItemStatus baseUrl={baseUrl} key={key} label={label} status="offline" to={to} />
      ));
  };

  const getFriendItems = (): ReactNode[] => {
    return friends
      .map(({accountNumber, nickname}) => ({
        baseUrl: `/account/${accountNumber}`,
        key: accountNumber,
        label: `${nickname ? `${nickname} - ` : ''}${accountNumber}`,
        to: `/account/${accountNumber}/overview`,
      }))
      .map(({baseUrl, key, label, to}) => <LeftSubmenuItem baseUrl={baseUrl} key={key} label={label} to={to} />);
  };

  const getNetworkItems = (): ReactNode[] => {
    if (!activePrimaryValidator) return [];
    return [
      {
        baseUrl: `/validator/${activePrimaryValidator.node_identifier}/banks`,
        key: 'Banks',
        label: 'Banks',
        to: `/validator/${activePrimaryValidator.node_identifier}/banks`,
      },
      {
        baseUrl: `/validator/${activePrimaryValidator.node_identifier}/validators`,
        key: 'Validators',
        label: 'Validators',
        to: `/validator/${activePrimaryValidator.node_identifier}/validators`,
      },
    ].map(({baseUrl, key, label, to}) => <LeftSubmenuItem baseUrl={baseUrl} key={key} label={label} to={to} />);
  };

  const getValidatorItems = (): ReactNode[] => {
    return validators
      .map(({ip_address: ipAddress, network_identifier: networkIdentifier}) => ({
        baseUrl: `/validator/${networkIdentifier}`,
        key: ipAddress,
        label: ipAddress,
        to: `/validator/${networkIdentifier}/overview`,
      }))
      .map(({baseUrl, key, label, to}) => (
        <LeftSubmenuItemStatus baseUrl={baseUrl} key={key} label={label} status="online" to={to} />
      ));
  };

  return (
    <div className="LeftMenu">
      <div className="points">
        <div className="points__title">Points</div>
        <div className="points__amount">{points.toLocaleString()}</div>
      </div>
      <LeftSubmenu
        leftIcon={<Icon className="LeftMenu__icon" icon={IconType.earth} />}
        menuItems={getNetworkItems()}
        title="Network"
      />
      <LeftSubmenu menuItems={[getActiveBank()]} title="Active Bank" titleOnly />
      <LeftSubmenu addOnClick={toggleAddAccountModal} menuItems={getAccountItems()} title="Accounts" />
      <LeftSubmenu addOnClick={toggleAddFriendModal} menuItems={getFriendItems()} title="Friends" />
      <LeftSubmenu addOnClick={noop} menuItems={getBankItems()} title="Managed Banks" />
      <LeftSubmenu addOnClick={noop} menuItems={getValidatorItems()} title="Managed Validators" />
      {addAccountModalIsOpen && <AddAccountModal close={toggleAddAccountModal} />}
      {addFriendModalIsOpen && <AddFriendModal close={toggleAddFriendModal} />}
    </div>
  );
};

export default LeftMenu;
