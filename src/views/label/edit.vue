<template>
    
        <!-- :title="title" 为新增或者编辑，从父组件里传过来 -->
        <!-- :before-close="handleClose" 关闭窗口的，取消可以使用这个方法 -->
        <el-dialog :title="title" :visible.sync="dialogVisible" width="400px" :before-close="handleClose">
            <!-- label-position="right" 右对齐 , status-icon 验证不通过，显示 x ，通过 显示对勾-->
            <el-form :rules="rules" ref="formData" :model="formData" label-width="100px" label-position="right" style="width: 300px" status-icon>
                <el-form-item label="标签名称" prop="name">
                    <el-input v-model="formData.name" placeholder="请输入标签名称"></el-input>
                </el-form-item>
                
                <el-form-item label="分类名称" prop="categoryId">
                    <el-select v-model="formData.categoryId" placeholder="请选择分类" clearable filterable>
                    <!-- clearable 可删除 ，filterable 可搜索,:value 提交给后台的数据-->
                         <el-option v-for="item in categoryList" :key="item.id" :label="item.name" :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="SubmitForm('formData')">确定</el-button>
                    <el-button @click="handleClose">取消</el-button>
                </el-form-item>
                
            </el-form>
        </el-dialog>

</template>

<script>
import api from '@/api/label'

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
        // 正常状态的分类列表数据
        categoryList: {
            type: Array,
            default: []
        },
        remoteClose: Function, // 用于关闭窗口，是个函数,父组件传过来
      

    },
    data(){
        return {
            rules:{ // 表单验证，prop的值
                name: [{required:true,message:"标签名称不能为空",trigger:'blur'}],
                categoryId: [{required:true,message:"分类名称不能为空",trigger:'change'}],
            },
            
        }
    },
    methods: {
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
        async submitData(){
            let response = null
            if (this.formData.id){
                response = await api.update(this.formData)
            }else{
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
            this.$nextTick(() => {
              // this.$nextTick()它是一个异步事件，当渲染结束 之后 ，它的回调函数才会被执行
              // 弹出窗口打开之后 ，需要加载Dom, 就需要花费一点时间，我们就应该等待它加载完dom之后，再进行调用resetFields方法，重置表单和清除样式
            this.$refs["formData"].resetFields();
          });
            this.remoteClose()  // 调用这个方法来关闭
        }
    }
}
</script>