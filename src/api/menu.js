import request from '@/utils/request'
// 菜单管理

export default{
    // query为查询的参数值，...query解耦
    getList(query){
        return request({
            url: `/system/menu/search`,
            method: 'post',
            data: {
                ...query
            }
        })

    },

    

    // 新增
    add(data){
        return request({
            url: `/system/menu`,
            method: 'post',
            data
        })
    },

    // 更新
    update(data){
        return request({
            url: `system/menu`,
            method: 'put',
            data,
        })
    },

  
    // 删除
    deleteById(id){
        return request({
            url: `/system/menu/${id}`,
            method: 'delete'
        })

    }
    }