<template>
            <!-- :title="title" 为新增或者编辑，从父组件里传过来 -->
        <!-- :before-close="handleClose" 关闭窗口的，取消可以使用这个方法 -->
        <el-dialog :title="title" :visible.sync="dialogVisible" width="500px" :before-close="handleClose">
            <!-- label-position="right" 右对齐 , status-icon 验证不通过，显示 x ，通过 显示对勾-->
            <el-form :rules="rules" ref="formData" :model="formData" label-width="100px" label-position="right" style="width: 400px" status-icon>
                <el-form-item label="角色名称" prop="name">
                    <el-input v-model="formData.name" placeholder="请输入名称"></el-input>
                </el-form-item>
                <el-form-item label="备注" prop="remark">
                     <el-input type='textarea' v-model="formData.remark" placeholder="请输入备注" style="width: 300px"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="SubmitForm('formData')">确定</el-button>
                    <el-button @click="handleClose">取消</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
</template>

<script>
import api from '@/api/role'

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
        remoteClose: Function, // 用于关闭窗口，是个函数,父组件传过来
      

    },

    data(){
        return {
            rules:{ // 表单验证，prop的值
                name: [{required:true,message:"请输入角色名称",trigger:'blur'}],
            
            },
            
        }
        },

    methods:{
        // 提交表单数据
        SubmitForm(formData){
            this.$refs[formData].validate((valid) => {
            if (valid) {
                // 校验通过，提交表单数据
                // 判断类型是否为按钮，按钮则不提交请求地址和图标，将这两个字段值设置为空
                if(this.formData.type === 3){
                    this.formData.url = ''
                    this.formData.icon = ''

                }
                this.submitData()

            } else {
                console.log('error submit!!');
                return false;
            }
            });

        },

        // submitData
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
    },

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
    }
    
}
</script>