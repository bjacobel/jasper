import React from 'react';
import ReactDOM from 'react-dom';
import {IssueEntity} from '../Type/IssueEntity';
import {View} from './Core/View';
import {ClickView} from './Core/ClickView';
import styled, {keyframes} from 'styled-components';
import {IconNameType} from '../Type/IconNameType';
import {color} from '../Style/color';
import {Icon} from './Core/Icon';
import {Text} from './Core/Text';
import {border, font, fontWeight, icon, iconFont, space} from '../Style/layout';
import {Image} from './Core/Image';
import {appTheme} from '../Style/appTheme';
import {ColorUtil} from '../Util/ColorUtil';
import {GitHubUtil} from '../Util/GitHubUtil';
import {IssueRepo} from '../Repository/IssueRepo';
import {DateUtil} from '../Util/DateUtil';
import {clipboard, shell} from 'electron';
import {ContextMenu, ContextMenuType} from './Core/ContextMenu';

type Props = {
  issue: IssueEntity;
  selected: boolean;
  fadeIn: boolean;
  onSelect: (issue: IssueEntity) => void;
  onReadAll: (issue: IssueEntity) => void;
  onReadCurrentAll: (issue: IssueEntity) => void;
  onUnsubscribe: (issue: IssueEntity) => void | null;
  onToggleBookmark: (issue: IssueEntity) => void;
  onToggleArchive: (issue: IssueEntity) => void;
  onToggleRead: (issue: IssueEntity) => void;
  onToggleIssueType: (issue: IssueEntity) => void;
  onToggleMilestone: (issue: IssueEntity) => void;
  onToggleLabel: (issue: IssueEntity, label: string) => void;
  onToggleAuthor: (issue: IssueEntity) => void;
  onToggleAssignee: (issue: IssueEntity, assignee: string) => void;
  onToggleRepoOrg: (issue: IssueEntity) => void;
  onToggleRepoName: (issue: IssueEntity) => void;
  onToggleIssueNumber: (issue: IssueEntity) => void;
  className?: string;
  // style?: CSSProperties;
}

type State = {
  showMenu: boolean;
}

export class IssueRow extends React.Component<Props, State> {
  state: State = {
    showMenu: false,
  }

  private menus: ContextMenuType[] = [];

  // パフォーマンス改善
  // menuはIssueRowの中で作るのが良さそう。そうすればmenuのチェックをしなくて住む
  // shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<State>, _nextContext: any): boolean {
  //   if (nextState.showMenu !== this.state.showMenu) return true;
  //
  //   if (nextProps.issue !== this.props.issue) return true;
  //   if (nextProps.issue.read_at !== this.props.issue.read_at) return true;
  //   if (nextProps.issue.closed_at !== this.props.issue.closed_at) return true;
  //   if (nextProps.issue.marked_at !== this.props.issue.marked_at) return true;
  //   if (nextProps.issue.archived_at !== this.props.issue.archived_at) return true;
  //   if (nextProps.issue.updated_at !== this.props.issue.updated_at) return true;
  //
  //   if (nextProps.selected !== this.props.selected) return true;
  //   if (nextProps.fadeIn !== this.props.fadeIn) return true;
  //   if (nextProps.className !== this.props.className) return true;
  //
  //   return false;
  // }

  componentDidUpdate(prevProps: Readonly<Props>, _prevState: Readonly<State>, _snapshot?: any) {
    // ショートカットキーJ/Kでissueを選択したとき、隠れている場合がある。
    // なので、選択状態に変わったときだけ、scrollIntoViewIfNeededで表示させる。
    if (!prevProps.selected && this.props.selected) {
      const el = ReactDOM.findDOMNode(this);
      el.scrollIntoViewIfNeeded(true);
    }
  }

  private isRequestOpen(ev: React.MouseEvent): boolean {
    return !!(ev.shiftKey || ev.metaKey)
  }

  // todo: これを上位に伝える
  private getOperationType(ev: React.MouseEvent): 'replace' | 'remove' | 'append' {
    if (ev.metaKey || ev.ctrlKey) {
      return 'replace';
    } else if (ev.shiftKey) { // remove
      return 'remove';
    } else {
      return 'append';
    }
  }

  private handleContextMenu() {
    const hideUnsubscribe = !this.props.onUnsubscribe;
    this.menus = [
      {label: 'Toggle Read and Unread', handler: () => this.handleToggleRead()},
      {label: 'Toggle Archive', handler: () => this.handleToggleArchive()},
      {label: 'Toggle Bookmark', handler: () => this.handleToggleBookmark()},
      {type: 'separator', hide: hideUnsubscribe},
      {label: 'Unsubscribe', handler: () => this.handleUnsubscribe(), hide: hideUnsubscribe},
      {type: 'separator'},
      {label: 'Mark Current All as Read', handler: () => this.handleReadCurrentAll()},
      {label: 'Mark All as Read', handler: () => this.handleReadAll()},
      {type: 'separator'},
      {label: 'Open with Browser', handler: () => this.handleOpenURL()},
      {type: 'separator'},
      {label: 'Copy Issue URL', handler: () => this.handleCopyURL()},
      {label: 'Copy Issue JSON', handler: () => this.handleCopyValue()},
    ];

    this.setState({showMenu: true});
  }

  private handleSelect(ev: React.MouseEvent) {
    if (this.isRequestOpen(ev)) {
      shell.openExternal(this.props.issue.value.html_url);
      return;
    }

    this.props.onSelect(this.props.issue);
  }

  private handleClickIssueType() {
    this.props.onToggleIssueType(this.props.issue);
  }

  private handleClickMilestone() {
    this.props.onToggleMilestone(this.props.issue);
  }

  private handleClickLabel(label: string) {
    this.props.onToggleLabel(this.props.issue, label);
  }

  private handleClickAuthor() {
    this.props.onToggleAuthor(this.props.issue);
  }

  private handleClickAssignee(loginName: string) {
    this.props.onToggleAssignee(this.props.issue, loginName);
  }

  private handleClickRepoOrg() {
    this.props.onToggleRepoOrg(this.props.issue);
  }

  private handleClickRepoName() {
    this.props.onToggleRepoName(this.props.issue);
  }

  private handleClickIssueNumber() {
    this.props.onToggleIssueNumber(this.props.issue);
  }

  private handleToggleRead() {
    this.props.onToggleRead(this.props.issue);
  }

  private handleToggleBookmark() {
    this.props.onToggleBookmark(this.props.issue);
  }

  private handleToggleArchive() {
    this.props.onToggleArchive(this.props.issue);
  }

  private handleUnsubscribe() {
    this.props.onUnsubscribe?.(this.props.issue);
  }

  private handleReadCurrentAll() {
    this.props.onReadCurrentAll(this.props.issue);
  }

  private handleReadAll() {
    this.props.onReadAll(this.props.issue);
  }

  private handleOpenURL() {
    shell.openExternal(this.props.issue.value.html_url);
  }

  private handleCopyURL() {
    clipboard.writeText(this.props.issue.value.html_url);
  }

  private handleCopyValue() {
    clipboard.writeText(JSON.stringify(this.props.issue.value, null, 2));
  }

  render() {
    const readClassName = IssueRepo.isRead(this.props.issue) ? 'issue-read' : 'issue-unread';
    const selectedClassName = this.props.selected ? 'issue-selected' : 'issue-unselected';
    const fadeInClassName = this.props.fadeIn ? 'issue-fadein' : '';

    return (
      <Root
        className={`${this.props.className} ${readClassName} ${selectedClassName} ${fadeInClassName}`}
        onClick={ev => this.handleSelect(ev)}
        onContextMenu={() => this.handleContextMenu()}
      >
        <Body>
          {this.renderIssueType()}
          {this.renderTitle()}
        </Body>
        <Attributes>
          {this.renderMilestone()}
          {this.renderLabels()}
        </Attributes>
        <Users>
          {this.renderAuthor()}
          {this.renderAssignees()}
          <View style={{flex: 1}}/>
          {this.renderCommentCount()}
        </Users>
        <Footer>
          {this.renderRepoName()}
          <View style={{flex: 1}}/>
          {this.renderUpdatedAt()}
        </Footer>
        <Actions className='issue-actions'>
          {this.renderRead()}
          {this.renderBookmark()}
          {this.renderArchive()}
          {this.renderCopyURL()}
        </Actions>

        <ContextMenu
          show={this.state.showMenu}
          onClose={() => this.setState({showMenu: false})}
          menus={this.menus}
        />
      </Root>
    );
  }

  private renderIssueType() {
    const issue = this.props.issue;
    const iconName: IconNameType = issue.value.pull_request ? 'source-pull' : 'alert-circle-outline';
    const iconColor = issue.value.closed_at ? color.issue.closed : color.issue.open;
    return (
      <IssueType onClick={() => this.handleClickIssueType()} title='filter issue/pr and open/closed'>
        <Icon name={iconName} color={iconColor} size={26}/>
      </IssueType>
    );
  }

  private renderTitle() {
    return (
      <Title>
        <TitleText>{this.props.issue.value.title}</TitleText>
      </Title>
    );
  }

  private renderMilestone() {
    const milestone = this.props.issue.value.milestone;
    if (!milestone) return;

    return (
      <Milestone onClick={() => this.handleClickMilestone()} title='filter milestone'>
        <Icon name='flag-variant' size={iconFont.small}/>
        <MilestoneText>{milestone.title}</MilestoneText>
      </Milestone>
    );
  }

  private renderLabels() {
    const labels = this.props.issue.value.labels;
    if (!labels?.length) return;

    const labelViews = labels.map((label, index) => {
      const textColor = ColorUtil.suitTextColor(label.color);
      return (
        <Label key={index} style={{background: `#${label.color}`}} onClick={() => this.handleClickLabel(label.name)} title='filter label'>
          <LabelText style={{color: `#${textColor}`}}>{label.name}</LabelText>
        </Label>
      );
    });

    return (
      <React.Fragment>
        {labelViews}
      </React.Fragment>
    );
  }

  private renderAuthor() {
    return (
      <Author onClick={() => this.handleClickAuthor()} title='filter author'>
        <Image source={{url: this.props.issue.value.user.avatar_url}}/>
      </Author>
    );
  }

  private renderAssignees() {
    const assignees = this.props.issue.value.assignees;
    if (!assignees?.length) return;

    const assigneeViews = assignees.map((assignee, index) => {
      return (
        <Assignee key={index} onClick={() => this.handleClickAssignee(assignee.login)} title='filter assignee'>
          <Image source={{url: assignee.avatar_url}}/>
        </Assignee>
      )
    });

    return (
      <React.Fragment>
        <AssigneeArrow>→</AssigneeArrow>
        {assigneeViews}
      </React.Fragment>
    );
  }

  private renderRepoName() {
    const {repoOrg, repoName} = GitHubUtil.getInfo(this.props.issue.value.url);

    return (
      <RepoName>
        <ClickView onClick={() => this.handleClickRepoOrg()} title='filter organization'>
          <RepoNameText>{repoOrg}</RepoNameText>
        </ClickView>
        <ClickView onClick={() => this.handleClickRepoName()} title='filter repository'>
          <RepoNameText>/{repoName}</RepoNameText>
        </ClickView>
        <Number onClick={() => this.handleClickIssueNumber()} title='filter issue number'>
          <NumberText>#{this.props.issue.value.number}</NumberText>
        </Number>
      </RepoName>
    );
  }

  private renderUpdatedAt() {
    const date = new Date(this.props.issue.value.updated_at);
    const updated  = DateUtil.localToString(date);
    const read = DateUtil.localToString(new Date(this.props.issue.read_at));
    return (
      <UpdatedAt title={`updated ${updated} / read ${read}`}>
        <UpdatedAtText>{DateUtil.fromNow(date)}</UpdatedAtText>
      </UpdatedAt>
    );
  }

  private renderCommentCount() {
    const date = new Date(this.props.issue.value.updated_at);
    const iconColor = this.props.selected ? color.white : appTheme().iconTinyColor;
    return (
      <CommentCount title={DateUtil.localToString(date)}>
        <Icon name='comment-text-outline' size={iconFont.tiny} color={iconColor}/>
        <CommentCountText>{this.props.issue.value.comments}</CommentCountText>
      </CommentCount>
    );
  }

  private renderBookmark() {
    const iconName: IconNameType = this.props.issue.marked_at ? 'bookmark' : 'bookmark-outline';
    return (
      <Action onClick={() => this.handleToggleBookmark()} title='toggle bookmark'>
        <ActionIcon name={iconName} size={iconFont.small}/>
      </Action>
    );
  }

  private renderArchive() {
    const iconName: IconNameType = this.props.issue.archived_at ? 'archive' : 'archive-outline';
    return (
      <Action onClick={() => this.handleToggleArchive()} title='toggle archive'>
        <ActionIcon name={iconName} size={iconFont.small}/>
      </Action>
    );
  }

  private renderRead() {
    const iconName: IconNameType = IssueRepo.isRead(this.props.issue) ? 'clipboard-check-outline' : 'clipboard-outline';
    return (
      <Action onClick={() => this.handleToggleRead()} title='toggle read'>
        <ActionIcon name={iconName} size={iconFont.small}/>
      </Action>
    );
  }

  private renderCopyURL() {
    return (
      <Action onClick={() => this.handleCopyURL()} title='copy URL'>
        <ActionIcon name='content-copy' size={iconFont.small}/>
      </Action>
    );
  }
}

const fadein = keyframes`
  from {
    opacity: 0.2;
  }
  to {
    opacity: 1;
  }
`;

const Root = styled(ClickView)`
  /* todo: なぜかこれがないと高さが確保できない。リファクタリング終わったら調査する */
  min-height: fit-content;
  
  position: relative;
  border-bottom: solid ${border.medium}px ${() => appTheme().borderColor};
  
  &.issue-unread {
  }
  
  &.issue-read {
    background: ${() => appTheme().issueReadBgColor};
  }
  
  &.issue-selected {
    background: ${() => appTheme().issueSelectedColor};
  }
  
  &.issue-unselected {
  }
  
  &.issue-fadein {
    animation: ${fadein} 1s;
  }
  
  &:hover .issue-actions {
    display: flex;
  }
`;

// body
const Body = styled(View)`
  flex-direction: row;
  width: 100%;
`;

const IssueType = styled(ClickView)`
  padding-top: ${space.medium}px;
  padding-left: ${space.medium}px;
  
  &:hover {
    opacity: 0.7;
  }
`;

const Title = styled(View)`
  flex: 1;
  min-height: 52px;
  padding-top: ${space.medium}px;
  padding-left: ${space.small}px;
  padding-right: ${space.medium}px;
`;

const TitleText = styled(Text)`
  font-size: ${font.small}px;
  
  .issue-unread & {
    font-weight: ${fontWeight.bold};
  }
  
  .issue-read & {
    color: ${() => appTheme().textTinyColor};
    font-weight: ${fontWeight.thin};
  }
  
  .issue-selected & {
    color: ${color.white};
  }
`;

// attributes
const Attributes = styled(View)`
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  padding: 0 ${space.medium}px;
`;

const Milestone = styled(ClickView)`
  flex-direction: row;
  align-items: center;
  background: ${() => appTheme().bg};
  border: solid ${border.medium}px ${() => appTheme().borderBold};
  border-radius: 4px;
  padding: 0 ${space.small}px;
  margin-right: ${space.medium}px;
  margin-bottom: ${space.medium}px;
  
  &:hover {
    opacity: 0.7;
  }
  
  .issue-selected & {
    opacity: 0.8;
  }
`;

const MilestoneText = styled(Text)`
  font-size: ${font.small}px;
`;

const Label = styled(ClickView)`
  border-radius: 4px;
  padding: 0 ${space.small}px;
  margin-right: ${space.medium}px;
  margin-bottom: ${space.medium}px;
  
  &:hover {
    opacity: 0.7;
  }
  
  .issue-selected & {
    opacity: 0.8;
  }
`;

const LabelText = styled(Text)`
  font-size: ${font.small}px;
`;

// users
const Users = styled(View)`
  flex-direction: row;
  align-items: center;
  padding: ${space.medium}px ${space.medium}px 0;
`;

const Author = styled(ClickView)`
  width: ${icon.small2}px;
  height: ${icon.small2}px;
  border-radius: 100%;
  
  &:hover {
    opacity: 0.7;
  }
`;

const Assignee = styled(ClickView)`
  width: ${icon.small2}px;
  height: ${icon.small2}px;
  border-radius: 100%;
  margin-right: ${space.small}px;
  
  &:hover {
    opacity: 0.7;
  }
`;

const AssigneeArrow = styled(Text)`
  font-size: ${font.small}px;
  margin: 0 ${space.small}px;
  font-weight: ${fontWeight.bold};
  
  .issue-selected & {
    color: ${color.white};
  }
`;

// footer
const Footer = styled(View)`
  flex-direction: row;
  align-items: center;
  padding: ${space.medium}px ${space.medium}px ${space.medium}px ${space.medium}px;
`;

const RepoName = styled(View)`
  flex-direction: row;
  align-items: center;
`;

const RepoNameText = styled(Text)`
  font-size: ${font.small}px;
  color: ${() => appTheme().textTinyColor};
  
  /* 文字がはみ出ないようにする */
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  word-break: break-all;
  
  &:hover {
    opacity: 0.7;
  }
  
  .issue-read & {
    font-weight: ${fontWeight.thin};
  }
  
  .issue-selected & {
    color: ${color.white};
  }
`;

const Number = styled(ClickView)`
  padding-left: ${space.small}px;
`;

const NumberText = styled(Text)`
  font-size: ${font.small}px;
  color: ${() => appTheme().textTinyColor};
  
  &:hover {
    opacity: 0.7;
  }
  
  .issue-read & {
    font-weight: ${fontWeight.thin};
  }
  
  .issue-selected & {
    color: ${color.white};
  }
`;

const CommentCount = styled(View)`
  flex-direction: row;
  align-items: center;
  padding-left: ${space.small2}px;
  position: relative;
  top: 4px;
`;

const CommentCountText = styled(Text)`
  font-size: ${font.tiny}px;
  color: ${() => appTheme().textTinyColor};
  padding-left: ${space.tiny}px;
  
  .issue-read & {
    font-weight: ${fontWeight.thin};
  }
  
  .issue-selected & {
    color: ${color.white};
  }
`;

const UpdatedAt = styled(View)`
  padding-left: ${space.small}px;
`;

const UpdatedAtText = styled(Text)`
  font-size: ${font.small}px;
  color: ${() => appTheme().textTinyColor};
  
  /* 文字がはみ出ないようにする */
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  word-break: break-all;
  
  .issue-read & {
    font-weight: ${fontWeight.thin};
  }
  
  .issue-selected & {
    color: ${color.white};
  }
`;

const Actions = styled(View)`
  display: none;
  position: absolute;
  bottom: ${space.small2}px;
  right: ${space.small2}px;
  background: ${() => appTheme().bg};
  border-radius: 4px;
  padding: 0 ${space.small}px;
  flex-direction: row;
  align-items: center;
  box-shadow: 0 0 4px 1px #0000001a;
`;

const Action = styled(ClickView)`
  padding: ${space.small}px ${space.small}px;
`;

const ActionIcon = styled(Icon)`
  color: ${() => appTheme().iconTinyColor};
  
  &:hover {
    opacity: 0.7;
  }
`;
