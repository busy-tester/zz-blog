/<template>
<!-- 角色管理 -->
    <div class="app-container">
        <!-- 搜索开始 -->
            <!--  :model="query" query 在 data 里已定义,v-model.trim 去掉用户输入的前后空格-->
                <el-form :inline="true" :model="query" class="demo-form-inline">
                <el-form-item label="角色名称">
                    <el-input v-model.trim="query.name" placeholder="请输入角色名称"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button icon="el-icon-search" type="primary" @click="queryData">查询</el-button>
                    <el-button icon="el-icon-refresh" @click="reload">重置</el-button>
                    <el-button icon="el-icon-circle-plus-outline" type="primary" @click="openAdd">新增</el-button>
                </el-form-item>
            </el-form>
        <!-- 搜索结束 -->

        <!-- 列表数据开始 -->
        <!-- align='center' 数据居中显示 -->
        <el-table :data="list" stripe border style="width: 100%">
            <el-table-column align='center' type="index" label="序号" width="80"></el-table-column>
            <el-table-column align='center' prop="name" label="角色名称" ></el-table-column>
            <el-table-column align='center' prop="remark" label="备注"></el-table-column>
            <el-table-column align='center' label="操作">
                <!-- slot-scope="scope" 获取当前行的数据 -->
                <template slot-scope="scope">
                    <!-- 根据后端返回该行的id进行编辑和删除 -->
                    <!-- 编辑时不需要在根据 id 获取数据了 -->
                    <el-button type="primary"  @click="handlePermission( scope.row.id)">分配权限</el-button>
                    <el-button type="success"  @click="handleEdit( scope.row)">编辑</el-button>
                    <el-button type="danger"  @click="handleDelete( scope.row.id)">删除</el-button>
                </template>
            </el-table-column>

        </el-table>
        <!-- 列表数据结束 -->

                    <!-- 分页 -->
                <!--
                    handleSizeChange 改变每页多少条调用这个方法，会传选择的条数过去
                    handleCurrentChange 点击页码调用这个方法，会传点击的页码过去
                    current-page当前的页码，data里定义的1，默认第一页
                    page-sizes 选择项，每页显示多少条
                    page-size 每页显示多少条，data里定义
                    layout="total, sizes, prev, pager, next, jumper"
                    total 总共多少条，去掉后不显示，sizes选择项，prev上一页的箭头，pager页码，next下一页的箭头，jumper前往多少页
                    -->
                <el-pagination
                @size-change="handleSizeChange" 
                @current-change="handleCurrentChange"
                :current-page="page.currentPage"
                :page-sizes="[10, 15, 20, 30]"
                :page-size="page.size"
                layout="total, sizes, prev, pager, next, jumper"
                :total="page.total"
                ></el-pagination>
            <!-- 分页结束 -->

            <!-- 使用子组件 -->
            <edit :title="edit.title" :dialogVisible="edit.dialogVisible" :formData="edit.formData" :remoteClose="remoteClose" />

            <!-- 设置权限组件 -->
            <permission title="分配权限" :dialogVisible="per.dialogVisible" :remoteClose="remotePerClose" :roleId="per.roleId"></permission>

    </div>
</template>
<script>
import api from '@/api/role'
import Edit from './edit'
import Permission from './permission'

export default {
    name: 'Role', // 和对应路由表中配置的name值一致
    components: {Edit,Permission},
    data(){
        return {
            list: [], // 列表数据
            page:{
                currentPage: 1,  // 当前页码
                size: 10,  // 每页显示多少条
                total: 0, // 总记录数
            },
            query: {},// 查询条件

            edit: {  // 传给子组件的值
                title: '', 
                dialogVisible: false,
                formData:{// 提交的表单数据
                    id: null,
                    name: "",
                    remark: ""
            }
            },
            per:{ // 分配组件权限的组件
                dialogVisible: false,
                roleId: null, // 角色id
            }
            
        }

    },
    created(){
        this.fetchData()
    },
    methods: {
        // 查询列表数据
        fetchData(){
            api.getList(this.query,this.page.currentPage,this.page.size).then(response=>{
                console.log(response)
                // 列表数据
                this.list = response.data.records
                // 总记录数
                this.page.total = response.data.total
            })

        },

        // 分配权限
        handlePermission(id){
            // 将电机的那个角色id传给子组件，子组件用来查询当前角色的权限
            this.per.roleId = id
            this.per.dialogVisible = true
        },

        // 编辑
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

        // 条件查询
        queryData(){
            // 将页码变为 1，第 1 页
            this.page.currentPage = 1
            // 因为 fetchData 已经将查询参数传给了后台，所以直接调用就可以了
            this.fetchData()

        },

        // 重置
        reload(){
            // 将条件置为空，重新获取数据
            this.query = {}
            this.fetchData()

        },

        // 当每页显示条数改变后被触发，val是最新的每页显示条数
        handleSizeChange(val) {
            this.page.size = val;
            this.fetchData();
        },

        // 当页码改变后被触发，val是最新的页码
        handleCurrentChange(val) {
            this.page.currentPage = val;
            this.fetchData();
          },

        // 新增按钮
        openAdd(){
 
            this.edit.formData = { // 不写会导致编辑后，在新增，输入框内容没有清空
                id: null,
                name: "",
                remark: ""
            }
            this.edit.dialogVisible = true
            this.edit.title = "新增"
        },

        // 子组件会被触发此事件关闭窗口
        remoteClose(){
            // 关闭弹框了，将数据置为空
            this.edit.formData = {
                id: null,
                name: "",
                remark: ""
            }
            
            // 要在父组件里关闭，不能在子组件里关闭
            this.edit.dialogVisible = false
            this.fetchData()

        },

        // 触发权限的事件关闭窗口
        remotePerClose(){
            this.per.dialogVisible = false
            this.per.roleId = null
            this.fetchData()

        }
    }

}
</script>