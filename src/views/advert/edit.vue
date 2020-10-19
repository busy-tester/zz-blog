<template>
    
        <!-- :title="title" 为新增或者编辑，从父组件里传过来 -->
        <!-- :before-close="handleClose" 关闭窗口的，取消可以使用这个方法 -->
        <el-dialog :title="title" :visible.sync="dialogVisible" width="500px" :before-close="handleClose">
            <!-- label-position="right" 右对齐 , status-icon 验证不通过，显示 x ，通过 显示对勾-->
            <el-form :rules="rules" ref="formData" :model="formData" label-width="100px" label-position="right" style="width: 400px" status-icon>
                <el-form-item label="广告图片" prop="imageUrl">
                    <!-- 使用 upload 组件 -->
                    <!-- class="avatar-uploader" 上传的样式，style里定义 -->
                    <!-- action 提交到后台的地址， show-file-list:是否显示已上传文件列表	 -->
                    <!-- :http-request覆盖默认的上传行为，可以自定义上传的实现	 -->
                    <el-upload
                            class="avatar-uploader"
                            action=""
                            :show-file-list="false"
                            :http-request="uploadMainImg">
                            <img v-if="formData.imageUrl" :src="formData.imageUrl" class="avatar">
                            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                    </el-upload>
                </el-form-item>
                
                <el-form-item label="广告标题" prop="title">
                    <el-input v-model="formData.title" placeholder="请输入广告标题" style="width: 300px"></el-input>
                </el-form-item>
                <el-form-item label="广告链接" prop="advertUrl">
                    <el-input v-model="formData.advertUrl" placeholder="请输入广告链接" style="width: 300px"></el-input>
                </el-form-item>
                <el-form-item label="跳转方式" prop="advertTarget">
                   <!-- _blank, _self -->
                        <el-select v-model="formData.advertTarget" >
                            <el-option label="新窗口打开" value="_blank"></el-option>
                            <el-option label="当前窗口打开" value="_self"></el-option>
                        </el-select>
                </el-form-item>
                <el-form-item label="状态" prop="status">
                    <el-radio-group v-model="formData.status">
                        <el-radio :label="1">正常</el-radio>
                        <el-radio :label="0">禁用</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="广告位置" prop="position">
                    <!-- min 最小值，max最大值 -->
                     <el-input-number v-model="formData.position"  :min="1" :max="1000" placeholder="排序值" style="width: 300px"></el-input-number>
                </el-form-item>
                <el-form-item label="排序" prop="sort">
                    <!-- min 最小值，max最大值 -->
                     <el-input-number v-model="formData.sort"  :min="1" :max="1000" placeholder="排序值" style="width: 300px"></el-input-number>
                </el-form-item>
                
                <el-form-item>
                    <el-button type="primary" @click="SubmitForm('formData')">确定</el-button>
                    <el-button @click="handleClose">取消</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>

</template>

<script>
import api from '@/api/advert'  // 导入接口

export default {
    props: {
        title:{  // 弹窗的标题
            type: String,
            default: ''
        },
        dialogVisible:{ // 弹出窗口，true 弹出
            type: Boolean,
            default: false
        },
        formData:{ // 提交的表单数据
            type: Object,
            default: {}
        },
        oldImageUrl: String ,  // 父组件传来的原始图片地址
        remoteClose: Function, // 用于关闭窗口，是个函数,父组件传过来
      

    },
    data(){
        return {
            rules:{ // 表单验证，prop的值
                imageUrl: [{required:true,message:"请上传图片",trigger:'change'}],
                advertTarget: [{required:true,message:"请选择打开方式",trigger:'blur'}],
                status: [{required:true,message:"请选择状态",trigger:'change'}],
            },
           
        }
    },
    methods: {
        // 关闭窗口 
        handleClose(){
            // dialogVisible 是父组件传来的值，不能直接修改，要不然会报错，所以下面的写法是错误的
            // this.dialogVisible = false
            this.$nextTick(() => {
              // this.$nextTick()它是一个异步事件，当渲染结束 之后 ，它的回调函数才会被执行
              // 弹出窗口打开之后 ，需要加载Dom, 就需要花费一点时间，我们就应该等待它加载完dom之后，再进行调用resetFields方法，重置表单和清除样式
              this.$refs["formData"].resetFields();
          });
            this.remoteClose()  // 调用这个方法来关闭
        },
        // 提交表单数据
        SubmitForm(formData){
            this.$refs[formData].validate((valid) => {
            if (valid) {
                // 校验通过，提交表单数据
                this.submitData()

            } else {
                console.log('error submit!!');
                return false;
            }
            });

        },
        // 上传图片, file上传的图片对象
        uploadMainImg(file){
                console.log("上传图片",file)
                const data = new FormData()
                data.append('file',file.file) // 前面的file 是后端的字段，后面的 file.file 才是前端给后台提交的文件
                api.uploadImg(data).then(response=>{
                    // 以防图片多次上传，将之前的图片删掉
                    this.deleteImg()
                    // 回显图片
                    this.formData.imageUrl = response.data
                }).catch(error=>{ // 上传图片可能会失败
                    this.$message({
                        type: 'error',
                        message: '上传失败'
                    })
                })

        },
        // 删除图片
        deleteImg(){
            // 如果之前有图片，则删除之前的，this.formData.imageUrl !== this.oldImageUrl 在编辑时，将 this.formData.imageUrl 赋值给 this.oldImageUrl
            if(this.formData.imageUrl && this.formData.imageUrl !== this.oldImageUrl){
                // 发送请求数据
                api.deleteImg(this.formData.imageUrl)
            }
        },

        async submitData(){ // 这个才是提交的数据，es6的写法
        let response = null // 定义一个全局的
            if(this.formData.id){
                // 有id，编辑
                response = await api.update(this.formData)
            }else{
                // 没有id，新增
                response = await api.add(this.formData)
            }

           
           if(response.code === 20000){
               this.$message({
                    showClose: true,
                    message: '保存成功',
                    type: 'success'
                });
            // 关闭窗口
            this.handleClose()
           }else{
               this.$message({
                    showClose: true,
                    message: '保存失败',
                    type: 'error'
                });
           }

        }
    },
}
</script>

<style>
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
</style>