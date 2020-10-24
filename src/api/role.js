import request from '@/utils/request'
// 角色管理

export default{
    // query为查询的参数值，...query解耦
    getList(query,currentPage=1,size=10){
        return request({
            url: `/system/role/search`,
            method: 'post',
            data: {
                ...query,
                currentPage,
                size,
            }
        })

    },

    

    // 新增
    add(data){
        return request({
            url: `/system/role`,
            method: 'post',
            data
        })
    },

    // 更新
    update(data){
        return request({
            url: `/system/role`,
            method: 'put',
            data,
        })
    },

  
    // 删除
    deleteById(id){
        return request({
            url: `/system/role/${id}`,
            method: 'delete'
        })

    },

    // 获取指定角色id所拥有的权限菜单ids 
    getMenuIdsByRoleId(id) { 
        return request({ 
            url: `/system/role/${id}/menu/ids`, // 反单引号 `` 
            method: 'get' }) 
        },
    
        // 提交菜单的ids给后台，需要两个参数，一个是用户id ，一个是所提交的权限 id
    saveRoleMenu(id, menuIds) {
         return request({ 
             url: `/system/role/${id}/menu/save`, 
             method: 'post', 
             data: menuIds 
                }) 
            },
    }