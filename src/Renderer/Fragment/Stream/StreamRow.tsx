import React from 'react';
import {StreamEntity} from '../../Library/Type/StreamEntity';
import styled from 'styled-components';
import {Icon} from '../../Library/View/Icon';
import {Text} from '../../Library/View/Text';
import {font, fontWeight, space} from '../../Library/Style/layout';
import {appTheme} from '../../Library/Style/appTheme';
import {ClickView} from '../../Library/View/ClickView';
import {ContextMenu, ContextMenuType} from '../../Library/View/ContextMenu';

type Props = {
  stream: StreamEntity;
  selected: boolean;
  title?: string;
  onSelect: (stream: StreamEntity) => void;
  onReadAll: (stream: StreamEntity) => void;
  onEdit?: (stream: StreamEntity) => void;
  onSubscribe?: (stream: StreamEntity) => void;
  onDelete?: (stream: StreamEntity) => void;
  onCreateStream?: (stream: StreamEntity) => void;
  onCreateChildStream?: (stream: StreamEntity) => void;
  className?: string;
}

type State = {
  showMenu: boolean;
}

export class StreamRow extends React.Component<Props, State> {
  state: State = {
    showMenu: false,
  };

  private menus: ContextMenuType[] = [];
  private contextMenuPos: {top: number; left: number};

  private handleContextMenu(ev: React.MouseEvent) {
    const menus: ContextMenuType[] = [
      {label: 'Mark All as Read', icon: 'check-all', handler: () => this.props.onReadAll(this.props.stream)}
    ];

    if (this.props.onEdit) {
      menus.push({label: 'Edit', icon: 'pencil-outline', handler: () => this.props.onEdit(this.props.stream)});
    }

    if (this.props.onSubscribe) {
      menus.push({type: 'separator'});
      menus.push({label: 'Subscribe', icon: 'volume-high', handler: () => this.props.onSubscribe(this.props.stream)});
    }

    if (this.props.onDelete) {
      menus.push({type: 'separator'});
      menus.push({label: 'Delete', icon: 'delete-outline', handler: () => this.props.onDelete(this.props.stream)});
    }

    if (this.props.onCreateChildStream) {
      menus.push({type: 'separator'});
      menus.push({label: 'Create Child Stream', icon: 'file-tree', handler: () => this.props.onCreateChildStream(this.props.stream)});
    }

    if (this.props.onCreateStream) {
      menus.push({type: 'separator'});
      menus.push({label: 'Create Stream', icon: 'github', handler: () => this.props.onCreateStream(this.props.stream)});
    }

    this.menus = menus;
    this.contextMenuPos = {top: ev.clientY, left: ev.clientX};
    this.setState({showMenu: true});
  }

  render() {
    const stream = this.props.stream;
    const selectedClassName = this.props.selected ? 'stream-selected' : '';
    const unreadClassName = stream.unreadCount ? 'stream-has-unread' : 'stream-no-unread';
    const enabledClassName = stream.enabled ? 'stream-enabled' : 'stream-disabled';
    const name = stream.name;
    const title = this.props.title || `${name} issues`;
    const unreadCount = stream.enabled ? stream.unreadCount : '';
    const iconColor = stream.color || appTheme().iconColor;

    return (
      <Root
        title={title}
        className={`${this.props.className} stream-row ${selectedClassName} ${unreadClassName} ${enabledClassName}`}
        onClick={() => this.props.onSelect(this.props.stream)}
        onContextMenu={(ev) => this.handleContextMenu(ev)}
      >
        <StreamIcon name={this.props.stream.iconName} color={iconColor}/>
        <StreamName>{name}</StreamName>
        <StreamUnreadCount className='stream-unread-count'>{unreadCount}</StreamUnreadCount>
        <StreamMenuIcon onClick={(ev) => this.handleContextMenu(ev)}>
          <Icon name='dots-vertical'/>
        </StreamMenuIcon>

        <ContextMenu
          show={this.state.showMenu}
          pos={this.contextMenuPos}
          onClose={() => this.setState({showMenu: false})}
          menus={this.menus}
          hideBrowserView={false}
        />
      </Root>
    );
  }
}

const Root = styled(ClickView)`
  flex-direction: row;
  align-items: center;
  padding-left: ${space.extraLarge}px;
  padding-right: ${space.medium}px;
  padding-top: ${space.tiny + 0.5}px;
  padding-bottom: ${space.tiny + 0.5}px;
  min-height: fit-content;
  
  &:hover {
    background: ${() => appTheme().bgSideSelect + '88'};
  }
  
  &.stream-selected {
    background: ${() => appTheme().bgSideSelect};
  }
`;

const StreamIcon = styled(Icon)`
  .stream-disabled & {
    opacity: 0.5;
  }
`;

const StreamName = styled(Text)`
  flex: 1;
  padding-left: ${space.small}px;
  
  /* 文字がはみ出ないようにする */
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  word-break: break-all;
  
  .stream-has-unread & {
    font-weight: ${fontWeight.bold};
  }
  
  .stream-no-unread & {
    color: ${() => appTheme().textSoftColor};
  }
  
  .stream-disabled & {
    opacity: 0.5;
    font-weight: ${fontWeight.medium};
  }
`;

const StreamUnreadCount = styled(Text)`
  font-size: ${font.small}px;
  color: ${() => appTheme().textSoftColor};
  min-width: 1.5em;
  text-align: right;
  
  .stream-no-unread & {
    font-weight: ${fontWeight.thin};
  }
  
  .stream-row:hover & {
    display: none;
  }
`;

const StreamMenuIcon = styled(ClickView)`
  display: none;
  min-width: 1.5em;
  position: relative;
  left: 8px;
  
  .stream-row:hover & {
    display: flex;
    opacity: 0.7;
  }
`;