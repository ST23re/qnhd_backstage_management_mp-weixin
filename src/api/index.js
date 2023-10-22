import { service } from '../utils/request';

export function refreshToken(token) {
  //刷新token
  return service({
    url: `/auth/${token}`,
    method: 'GET',
  });
}

export function loginByAccount(data) {
  //通过昵称或电话登录
  return service({
    url: `/auth`,
    method: 'GET',
    data,
  });
}

export function loginThroughTWT(data) {
  //通过twt账号登陆
  return service({
    url: `/auth/passwd`,
    method: 'GET',
    data,
  });
}

export function getNotice() {
  //获取公告
  return service({
    url: `/notices`,
    method: 'GET',
  });
}

export function postNotice(data) {
  //添加公告
  return service({
    url: `/notice`,
    method: 'POST',
    data,
  });
}

export function putNotice(data) {
  //修改公告
  return service({
    url: `/notice/modify`,
    method: 'POST',
    data,
  });
}

export function deleteNotice(data) {
  //删除公告
  return service({
    url: `/notice/delete`,
    method: 'GET',
    data,
  });
}

export function banUser(data) {
  //添加封号用户
  return service({
    url: `/banned`,
    method: 'POST',
    data,
  });
}

export function deleteBlockedUser(data) {
  //删除禁言用户
  return service({
    url: `/blocked/delete`,
    method: 'GET',
    data,
  });
}

export function blockUser(data) {
  //添加禁言用户
  return service({
    url: `/blocked`,
    method: 'POST',
    data,
  });
}

export function getBlockedUser(data) {
  //获取禁言用户
  return service({
    url: `/blocked`,
    method: 'GET',
    data,
  });
}

export function getUser(data) {
  //获取用户
  return service({
    url: `/users/common`,
    method: 'GET',
    data,
  });
}

export function getSpecificUser(data) {
  //获取指定uid用户
  return service({
    url: `/user/common`,
    method: 'GET',
    data,
  });
}

export function getSelf() {
  //获取自己信息
  return service({
    url: `/user/info`,
    method: 'GET',
  });
}

export function getReports(data) {
  //获取举报列表
  return service({
    url: `/reports`,
    method: 'GET',
    data,
  });
}

export function getPostsPreview(data) {
  //获取多个简短post, 用于所有帖子的预览，及搜索结果的初态
  return service({
    url: `/posts`,
    method: 'GET',
    data,
  });
}

export function getPost(data) {
  //获取单个post, 即点开预览后
  return service({
    url: `/post`,
    method: 'GET',
    data,
  });
}

export function deletePost(data) {
  return service({
    url: `/post/delete`,
    method: 'GET',
    data,
  });
}

export function getFloors(data) {
  return service({
    url: `/floors`,
    method: 'GET',
    data,
  });
}

export function deleteFloor(data) {
  return service({
    url: `/floor/delete`,
    method: 'GET',
    data,
  });
}

export function newUser(data) {
  //注册用户
  return service({
    url: `/user`,
    method: 'POST',
    data,
  });
}

export function getAdmin(data) {
  //获取所有管理员，仅超管
  return service({
    url: `/users/manager`,
    method: 'GET',
    data,
  });
}

export function deleteAdmin(data) {
  return service({
    url: `/user/manager/delete`,
    method: 'GET',
    data,
  });
}

export function changeAdminInfo(data) {
  //超管修改管理员信息
  return service({
    url: `/user/modify/super`,
    method: 'POST',
    data,
  });
}

export function changeRight(data) {
  //修改用户权限，仅超管
  return service({
    url: `/user/right/modify`,
    method: 'POST',
    data,
  });
}

export function modifyDepartment(data) {
  //给校方管理员分配或修改部门，仅超管
  return service({
    url: `/user/department/modify`,
    method: 'POST',
    data,
  });
}

export function getDepartments(data) {
  //获取部门
  return service({
    url: `/departments`,
    method: 'GET',
    data,
  });
}

export function addDepartment(data) {
  //添加部门
  return service({
    url: `/department`,
    method: 'POST',
    data,
  });
}

export function deleteDepartment(data) {
  //删除部门
  return service({
    url: `/department/delete`,
    method: 'GET',
    data,
  });
}

export function modifyDepIntroduction(data) {
  //修改部门内容
  return service({
    url: `/department/modify`,
    method: 'POST',
    data,
  });
}

export function getBlockedLog(data) {
  //操作记录--禁言
  return service({
    url: `/blocked`,
    method: 'GET',
    data,
  });
}

export function getBannedLog(data) {
  //操作记录--封号
  return service({
    url: `/banned`,
    method: 'GET',
    data,
  });
}

export function getReplys(data) {
  //获取帖子内跟校方回复相关的回复
  return service({
    url: `/post/replys`,
    method: 'GET',
    data,
  });
}

export function getTags(data) {
  //搜索tag
  return service({
    url: `/tags`,
    method: 'GET',
    data,
  });
}

export function getHotTags() {
  //获取热榜
  return service({
    url: `/tags/hot`,
    method: 'GET',
  });
}

export function deleteTag(data) {
  //删除tag
  return service({
    url: `/tag/delete`,
    method: 'GET',
    data,
  });
}

export function changeSelfPhone(data) {
  //修改自己手机号
  return service({
    url: `/user/phone/modify`,
    method: 'POST',
    data,
  });
}

export function changeSelfPass(data) {
  //修改自己密码
  return service({
    url: `/user/passwd/modify`,
    method: 'POST',
    data,
  });
}

export function getGames() {
  return service({
    url: `/game`,
    method: 'GET',
  });
}

export function modifyGames(data) {
  return service({
    url: `/game`,
    method: 'POST',
    data,
  });
}

export function reveal(data) {
  //开盒使用
  return service({
    url: `/user/detail`,
    method: 'GET',
    data,
  });
}

export function getSensitive() {
  //敏感词文件
  return service({
    url: `/sensitive`,
    method: 'GET',
  });
}

export function addSensitive(data) {
  //追加敏感词
  return service({
    url: `/sensitive/words`,
    method: 'POST',
    data,
  });
}

export function getPostTypes() {
  //获取全部贴子
  return service({
    url: `/posttypes`,
    method: 'GET',
  });
}

export function revealThroughTag(data) {
  //通过tag开盒
  return service({
    url: `/tag/detail`,
    method: 'GET',
    data,
  });
}

export function deleteReport(data) {
  //删除举报
  return service({
    url: `/report/delete`,
    method: 'GET',
    data,
  });
}

export function refinePost(data) {
  //帖子加精
  return service({
    url: `/post/value`,
    method: 'POST',
    data,
  });
}

export function transferPostType(data) {
  //修改帖子类型
  return service({
    url: `/post/transfer/type`,
    method: 'POST',
    data,
  });
}

export function getTheFloor(data) {
  //获取单个楼层
  return service({
    url: `/floor`,
    method: 'GET',
    data,
  });
}

export function getSubFloors(data) {
  //获取楼层内全部回复
  return service({
    url: `/floor/replys`,
    method: 'GET',
    data,
  });
}

export function recoverPost(data) {
  //恢复已删除帖子
  return service({
    url: `/post/recover`,
    method: 'POST',
    data,
  });
}

export function recoverFloor(data) {
  //恢复已删除楼层
  return service({
    url: `/floor/recover`,
    method: 'POST',
    data,
  });
}

export function setETag(data) {
  //修改帖子e_tag
  return service({
    url: `/post/etag`,
    method: 'POST',
    data,
  });
}

export function resetNickname(data) {
  //重置用户昵称
  return service({
    url: `/user/nickname/reset`,
    method: `POST`,
    data,
  });
}

export function deletePostPic(data) {
  //删除帖子图片
  return service({
    url: `/post_image/delete`,
    method: `GET`,
    data,
  });
}
