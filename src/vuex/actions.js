/*
 * set设置、add添加、delete删除、update修改
 * 车辆列表
 */

export const setList = ({ dispatch }, key, arr) => {
    dispatch('SET_LIST', key, arr)
}

export const addList = ({ dispatch }, key, arr) => {
    dispatch('ADD_LIST', key, arr)
}
export const addBList = ({ dispatch }, key, arr) => {//数组前面加入一项
    dispatch('ADDB_LIST', key, arr)
}

export const deleteList = ({ dispatch }, key, index) => {
    dispatch('DELETE_LIST', key, index)
}

export const updateList = ({ dispatch }, key, index,status) => {
    dispatch('UPDATE_LIST', key, index, status)
}
export const updateAllList = ({ dispatch }, key, index,val) => {//修改一整条记录
    dispatch('UPDATEALL_LIST', key, index, val)
}
export const setTokenValue = ({ dispatch }, key,val) => {
    dispatch('SET_TOKEN_VALUE', key, val)
}
/*
 * 用户信息
 */
/* 修改用户信息 */
export const setUser_store_info = ({ dispatch }, data) => {
	dispatch('SET_USER_STORE_INFO', data)
}
export const setUser_means_info = ({ dispatch }, key,value) => {
    dispatch('SET_USER_MEANS_INFO', key,value)
}

export const setass = ({ dispatch }, key, arr) => {
    dispatch('SET_PRODUCTLIST_WASH', key, arr)
}
/*修改地址*/ 
export const set_address = ({ dispatch }, key, arr) => {
    dispatch('SET_ADD_LIST', key, arr)
}
export const set_add_info = ({ dispatch }, key,value) => {
    dispatch('SET_ADD_INFO', key,value)
}