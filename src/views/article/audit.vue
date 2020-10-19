<template>
     <!-- :title="title" 为新增或者编辑，从父组件里传过来 -->
        <!-- :before-close="handleClose" 关闭窗口的，取消可以使用这个方法 -->
        <el-dialog :title="title" :visible.sync="dialogVisible" width="70%" :before-close="handleClose">
             <el-form ref="formData" :model="formData" label-width="100px" label-position="right" >
                <el-form-item label="标题" >
                    <el-input v-model="formData.title" readonly></el-input>
                </el-form-item>
                <el-form-item label="标签" >
                    <!-- 级联选择器 -->
                    <!-- multiple:true：多选 children:'labelList'：指定选项的子选项为选项对象的某个属性值。value:'id',label:'name',emitPath:false -->
                    <el-cascader
                            disabled
                            :options="labelOptions"
                            style="display:block"
                            v-model="formData.labelIds"
                            :props="{multiple:true,children:'labelList',value:'id',label:'name',emitPath:false}"
                            clearable>
                    </el-cascader>
                </el-form-item>
                
                <el-form-item label="主图" >
                   <img :src="formData.imageUrl" style="width: 178px; height:178px; display:block" />
                </el-form-item>
                <el-form-item label="是否公开" >
                    <el-radio-group v-model="formData.ispublic" disabled>
                        <el-radio :label="1">公开</el-radio>
                        <el-radio :label="0">不公开</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="简介">
                     <el-input type='textarea' v-model="formData.summary" readonly></el-input>
                </el-form-item>
                <el-form-item label="内容">
                    <!-- markdown 编辑器 -->
                    <!-- v-model="formData.mdContent":接口返回的数据 :editable="false"： 不能编辑 -->
                     <mavon-editor v-model="formData.mdContent" :editable="false" />
                </el-form-item>
                <!-- align="center"按钮居中，  v-if="isAudit"是否显示两个按钮，查看就不需要显示，审核才会显示 -->
                <el-form-item align="center" v-if="isAudit">
                    <el-button type="primary" @click="auditSuccess()">审核通过</el-button>
                    <el-button type="danger" @click="auditFail()">审核不通过</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
</template>

<script>
import api from '@/api/article'
import categoryApi from '@/api/category'
// 引用 mavon-editor 组件与样式
import { mavonEditor } from 'mavon-editor' // 要用 { } ,否则会报错
import 'mavon-editor/dist/css/index.css'

export default {
        components: { mavonEditor}, // 注册为子组件
        props: {
            id: null, // 文章 id
            isAudit: true, // 是否为审核页面，true为审核
            title:{  // 弹窗的标题
                type: String,
                default: ''
            },
            dialogVisible:{ // 弹出窗口，true 弹出
                type: Boolean,
                default: false
            },
        
            remoteClose: Function, // 用于关闭窗口，是个函数,父组件传过来

            },

        data(){
            return{
                formData: {},  // 查询到的文章详情
                labelOptions: [], // 标签数据
            }
        },
        watch: {  // 监听
            dialogVisible(val){  // 监听 dialogVisible 的变化，将改变之后的值作为参数传入，如果为 true，表示打开窗口，如果为false，表示关闭窗口，不查询
                if(val){
                    this.getLabelOptions() // 获取所有分类下的标签
                    this.getArticleById()  // 查询文章详情，不包括标签和内容字段
                }

            }

        },
        methods:{
            // 关闭窗口 
            handleClose(){
                
                this.remoteClose()  // 调用这个方法来关闭
            },
            // 审核通过
            auditSuccess(){
                this.$confirm('确定审核通过吗？','提示',{
                    confirmButtonText: '确定',
                    cancelButtonText: '在想想',
                    type: 'warning'
                }).then(()=>{
                    // 确认
                    api.auditSuccess(this.id).then(response=>{
                        // 提示信息
                        this.$message({
                            type: 'success',
                            message: '审核通过提交成功'
                        })
                        // 关闭窗口
                        this.remoteClose()
                    })
                }).catch(()=>{
                    // 取消删除，不理会
                })

            },
            // 审核不通过
            auditFail(){
                    this.$confirm('确定审核不通过吗？','提示',{
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(()=>{
                    // 确认
                    api.auditFail(this.id).then(response=>{
                        // 提示信息
                        this.$message({
                            type: 'success',
                            message: '审核不通过提交成功'
                        })
                        // 关闭窗口
                        this.remoteClose()
                    })
                }).catch(()=>{
                    // 取消删除，不理会
                })
            },
            // 查询文章详情,watch监听
            getArticleById(){
                // 通过id查询数据
                api.getById(this.id).then(response =>{
                    this.formData = response.data
                })
            },
            // 获取所有分类下的标签
            getLabelOptions(){
                categoryApi.getCategoryAndLabel().then(response=>{
                    this.labelOptions = response.data
                })
            }
        }
    
}
</script>