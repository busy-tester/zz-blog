import request from '@/utils/request'
// 广告管理

export default{
    // 分页条件查询列表,query为查询的参数值，...query解耦
    getList(query,currentPage=1,size=10){
        return request({
            url: `/article/advert/search`,
            method: 'post',
            data: {
                ...query,
                currentPage,
                size
            }
        })

    },

    // 上传图片接口
    uploadImg(data={}){
        return request({
            url:`/article/file/upload`,
            method: 'post',
            data 
        })
    },

    // 删除图片接口
    deleteImg(imageUrl){
        return request({
            url:`/article/file/delete`,
            method: 'delete',
            params: {"fileUrl": imageUrl}  //  fileUrl 后端定义的接口字段，imageUrl 前端传的图片地址
        })
    },

    // 新增
    add(data){
        return request({
            url: `/article/advert`,
            method: 'post',
            data
        })
    },

    // 更新
    update(data){
        return request({
            url: `article/advert`,
            method: 'put',
            data,
        })
    },

  
    // 删除
    deleteById(id){
        return request({
            url: `/article/advert/${id}`,
            method: 'delete'
        })

    }
    }