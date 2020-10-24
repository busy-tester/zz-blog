<template>
            <!-- :title="title" 为新增或者编辑，从父组件里传过来 -->
        <!-- :before-close="handleClose" 关闭窗口的，取消可以使用这个方法 -->
        <el-dialog :title="title" :visible.sync="dialogVisible" width="500px" :before-close="handleClose">
            <!-- label-position="right" 右对齐 , status-icon 验证不通过，显示 x ，通过 显示对勾-->
            <!-- v-loading="loading" 值为 true时，显示加载中 -->
            <el-form  v-loading="loading" label-width="100px" label-position="right" style="width: 400px" status-icon>
                <!-- data 绑定的渲染数据，
                show-checkbox 显示勾选框 
                node-key 每个树节点用来作为唯一标识的属性 
                default-checked-keys 默认勾选 
                :props="{children:'children',label:'name'}" 我们接口返回的一级和二级的字段名，label 是一级，我们接口对应的字段是 name
                accordion 每次只打开一个同级树节点展开 ，会将之前展开的隐藏
                highlight-current 高亮当前选中节点 
                :default-checked-keys="menuIds" 默认勾选的集合
                ref="tree" 获取所有选中的 id，需要加这个
                -->
                <el-tree
                    ref="tree"
                    :data="menuList"
                    show-checkbox
                    node-key="id"
                    :props="{children:'children',label:'name'}"
                    :default-checked-keys="menuIds"
                    accordion
                    >
            </el-tree>
            <el-form-item>
                    <el-button type="primary" @click="SubmitForm('formData')">确定</el-button>
                    <el-button @click="handleClose">取消</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
</template>

<script>
import menuApi from "@/api/menu"
import roleApi from "@/api/role"

  export default {
    props:{
        title:{  // 弹窗的标题
            type: String,
            default: ''
        },
        dialogVisible:{ // 弹出窗口，true 弹出
            type: Boolean,
            default: false
        },
        remoteClose: Function, // 用于关闭窗口，是个函数,父组件传过来
        roleId: null,
      },

    data() {
        return {
            menuList: [], // 存储所有菜单
            loading: false, // 加载中，true 则显示加载中，false 不显示加载中
            menuIds: [], // 所有菜单的权限 ids
            
      };
    },

      watch:{
          dialogVisible(val){
              if(val){
                //   dialogVisible 为 true 则加载所有菜单
                this.getMenuList()
              }
          }
      },
      methods: {
        //   获取所有菜单
        getMenuList(){
            this.loading = true
            menuApi.getList({}).then(response=>{
                this.menuList = response.data
                // 查询角色之前所拥有的菜单 ids ，然后进行回显
                this.getMenuIdsByRoleId()

            })
            this.loading = false // 数据加载完成
        },
        
        // 查询角色之前所拥有的菜单 ids ，然后进行回显
        getMenuIdsByRoleId(){
            roleApi.getMenuIdsByRoleId(this.roleId).then(response=>{
                this.menuIds = response.data

            })
        },

        // 提交权限数据
        SubmitForm(formData){
            // elementui 提供的方法，获取所有选中的 id，组成一个列表
            const checkedMenuIds = this.$refs.tree.getCheckedKeys()
            roleApi.saveRoleMenu(this.roleId,checkedMenuIds).then(response=>{
                if(response.code === 20000){
                    this.$message({
                        message:"分配权限成功",
                        type:"success"

                    })
                    // 关闭窗口
                    this.handleClose()

                }else{
                    this.$message({
                        message:"分配权限失败",
                        type:"error"

                    })

                }

            })

          },
        // 关闭窗口
        handleClose(){
            this.menuList = []
            this.menuIds = []
            this.remoteClose()
          }
      },

  };
</script>