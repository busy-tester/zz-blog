<template>
<!-- 菜单管理 -->
    <!--  class="app-container" 列表距离上下左右的间隔  -->
    <div class="app-container">

        <!-- 搜索开始 -->
            <!--  :model="query" query 在 data 里已定义,v-model.trim 去掉用户输入的前后空格-->
                <el-form :inline="true" :model="query" class="demo-form-inline">
                <el-form-item label="菜单名称">
                    <el-input v-model.trim="query.name" placeholder="请输入菜单名称"></el-input>
                </el-form-item>
                
                <el-form-item>
                    <el-button icon="el-icon-search" type="primary" @click="fetchData">查询</el-button>
                    <el-button icon="el-icon-refresh" @click="reload">重置</el-button>
                    <!-- 传个 0 ，表示最上面的菜单 -->
                    <el-button icon="el-icon-circle-plus-outline" type="primary" @click="handleAdd(0)">新增</el-button>
                </el-form-item>
            </el-form>
        <!-- 搜索结束 -->


         <!-- 列表数据开始 -->
        <!-- align='center' 数据居中显示 -->
        <!-- 支持树类型的数据的显示。当 row 中包含 children 字段时，被视为树形数据。渲染树形数据时，必须要指定 row-key -->
        <el-table :data="list" stripe border row-key="id" style="width: 100%">
            <el-table-column align='center' type="index" label="序号" width="80"></el-table-column>
            <el-table-column align='center' prop="name" label="名称" ></el-table-column>
            <el-table-column align='center' prop="url" label="请求地址"  ></el-table-column>
            <el-table-column align='center' prop="code" label="权限标识"  ></el-table-column>
            <el-table-column align='center' prop="type" label="类型"  >
                <template slot-scope="scope">
                    <!-- 1目录，2菜单，3按钮 -->
                    <span v-if="scope.row.type===1">目录</span>
                    <span v-if="scope.row.type===2">菜单</span>
                    <span v-if="scope.row.type===3">按钮</span>
                </template>
            </el-table-column>
            <el-table-column align='center' prop="icon" label="图标"  ></el-table-column>
            <el-table-column align='center' prop="sort" label="排序"  ></el-table-column>
            
            <el-table-column align='center' label="操作" min-width="90px">
                <!-- slot-scope="scope" 获取当前行的数据 -->
                <template slot-scope="scope">
                    <!-- 根据后端返回该行的id进行编辑和删除 -->
                    <!-- 编辑时不需要在根据 id 获取数据了 -->
                    <el-button type="primary" icon="el-icon-circle-plus-outline" circle @click="handleAdd( scope.row.id)"></el-button>
                    <el-button type="primary" icon="el-icon-edit" circle @click="handleEdit( scope.row)"></el-button>
                    <el-button type="danger" icon="el-icon-delete" circle @click="handleDelete( scope.row.id)"></el-button>
                </template>
            </el-table-column>

        </el-table>
        <!-- 列表数据结束 -->


            <!-- 使用子组件 -->
            <edit :title="edit.title" :dialogVisible="edit.dialogVisible" :formData="edit.formData" :remoteClose="remoteClose" />
    </div>
</template>
<script>
import api from '@/api/menu'
import Edit from './edit'

export default {
    name: 'Menu', // 和对应路由表中配置的name值一致
    components: {Edit},
    data(){
        return {
            query: {}, // 条件查询
            list:[], // 列表数据
            edit: {  // 传给子组件的值
                title: '', 
                dialogVisible: false,
                formData:{// 提交的表单数据
                    id: null,
                    type: null,
                    name: "",
                    code: "",
                    url: "",
                    icon: "",
                    sort: null,
                    remark: ""
            }
            }
        }
    },

    created(){
        this.fetchData()
    },

    methods:{
        fetchData(){
            api.getList(this.query).then(response=>{
                this.list = response.data
            })
        },

        // 新增菜单，将 id 作为新菜单的 parentId
        handleAdd(id){

            this.edit.formData = {
                    id: null,
                    type: null,
                    name: "",
                    code: "",
                    url: "",
                    icon: "",
                    sort: null,
                    remark: ""
                }
            // id = 0 是在条件查询的地方点击的，是新增一级菜单，否则新增的是某菜单下的子菜单
            this.edit.formData.parentId = id
            this.edit.title = '新增'
            this.edit.dialogVisible = true
            

        },

        // 子组件会被触发此事件关闭窗口
        remoteClose(){
            // 关闭弹框了，将数据置为空
            this.edit.formData = {
                    id: null,
                    type: null,
                    name: "",
                    code: "",
                    url: "",
                    icon: "",
                    sort: null,
                    remark: ""
            }
            
            // 要在父组件里关闭，不能在子组件里关闭
            this.edit.dialogVisible = false
            this.fetchData()

        },

        // 编辑菜单
        handleEdit(data){

            this.edit.formData = data
            this.edit.title = "编辑"
            this.edit.dialogVisible = true
        },

        // 删除
        handleDelete(id){
            this.$confirm('确认删除当前节点与子节点记录吗?', '提示', {
                  confirmButtonText: '确认',
                  cancelButtonText: '取消',
              }).then(() => {
                  // 确认
                  api.deleteById(id).then(response => {
                      const res = response
                      // 删除成功或失败的提示信息
                      this.$message({
                          message: res.message,
                          type: res.code === 20000 ? 'success': 'error'
                      })
                      if(res.success) {
                          // 删除成功，刷新列表数据
                          this.fetchData()
                      }
                  })
              }).catch(() => {
                  // 取消，不用理会
                  console.log('取消')
              })

        },
        // 重置
        reload(){
            // 将条件置为空，重新获取数据
            this.query = {}
            this.fetchData()

        },


    }

}
</script>