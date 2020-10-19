import request from '@/utils/request'
// 文章管理

export default{
    // 分页条件查询列表,query为查询的参数值，...query解耦
    getList(query,currentPage=1,size=10){
        return request({
            url: `article/article/search`,
            method: 'post',
            data: {
                ...query,
                currentPage,
                size
            }
        })

    },
    // 通过 id 查询数据
    getById(id){
        return request({
            url: `article/article/${id}`,
            method: 'get'
        })
    },

    // 审核通过
    auditSuccess(id){
        return request({
            url: `/article/article/audit/success/${id}`,
            method: 'get'
        })
    },

    // 审核不通过
    auditFail(id){
        return request({
            url: `/article/article/audit/fail/${id}`,
            method: 'get'
        })
    },

    // 删除
    deleteById(id){
        return request({
            url: `/article/article/${id}`,
            method: 'delete'
        })

    }
    }