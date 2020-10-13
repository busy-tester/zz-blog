<template>
 <!-- 标签管理 -->
    <!--  class="app-container" 列表距离上下左右的间隔  -->
    <div class="app-container">
         <!-- 搜索开始 -->
            <!--  :model="query" query 在 data 里已定义,v-model.trim 去掉用户输入的前后空格-->
                <el-form :inline="true" :model="query" class="demo-form-inline">
                <el-form-item label="标签名称">
                    <el-input v-model.trim="query.name" ></el-input>
                </el-form-item>
                <el-form-item label="分类名称">
                    <el-select v-model="query.categoryId" placeholder="请选择分类" clearable filterable>
                    <!-- clearable 可删除 ，filterable 可搜索,:value 提交给后台的数据-->
                         <el-option v-for="item in categoryList" :key="item.id" :label="item.name" :value="item.id"></el-option>
                    </el-select>
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
            <el-table-column align='center' prop="name" label="标签名称" ></el-table-column>
            <el-table-column align='center' prop="categoryName" label="分类名称"  ></el-table-column>
            <el-table-column align='center' label="操作">
                <!-- slot-scope="scope" 获取当前行的数据 -->
                <template slot-scope="scope">
                    <!-- 根据后端返回该行的id进行编辑和删除 -->
                    <!-- 编辑时不需要在根据 id 获取数据了 -->
                    <el-button type="primary" icon="el-icon-edit" circle @click="handleEdit( scope.row)"></el-button>
                    <el-button type="danger" icon="el-icon-delete" circle @click="handleDelete( scope.row.id)"></el-button>
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

        <!-- 子组件 -->
        <edit :title="edit.title" :dialogVisible="edit.dialogVisible" :formData="edit.formData" :remoteClose="remoteClose" :categoryList="categoryList"/>

    </div>
</template>
<script>
import api from '@/api/label'
import categoryApi from '@/api/category'
import Edit from './edit' // 导入子组件

export default {
        name: 'Label', // 和对应路由表中配置的name值一致
        components: { Edit}, // 引用组件才能使用
        data(){
            return {
                list: [], // 列表数据
                page:{
                    currentPage: 1,  // 当前页码
                    size: 10,  // 每页显示多少条
                    total: 0, // 总记录数
                },
                query: {},// 查询条件
                categoryList: [],  // 数组存储正常状态的分类
                
                edit: {  // 传给子组件的值
                    title: '', 
                    dialogVisible: false,
                    formData:{// 提交的表单数据
                        id: null,
                        name: "",
                        categoryId: "",
                        
                }
                }
                
            }

        },
        created(){
            this.fetchData()
            this.getCategoryList()  // 获取所有正常的分类
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
            // 获取所有正常的分类
            async getCategoryList(){
                const response = await categoryApi.getNormalList()
                this.categoryList = response.data
            },
            // 编辑
            handleEdit(data){
                console.log(data)
                this.edit.formData = data
                this.edit.title = "编辑"
                this.edit.dialogVisible = true
            },
            // 删除
            handleDelete(id){
                this.$confirm('该操作将永久性删除数据，请谨慎操作。', '提示', {
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
             // 新增按钮
            openAdd(){
                this.getCategoryList() // 重新查询，要不然查询的数据是旧的
                this.edit.formData = {
                    id: null,
                    name: "",
                    categoryId: "",
                }
                this.edit.dialogVisible = true
                this.edit.title = "新增"

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
            // 关闭弹窗
            remoteClose(){
                // 关闭弹框了，将数据置为空
                this.edit.formData = {
                    id: null,
                    name: "",
                    categoryId: "",
                }
            // 要在父组件里关闭，不能在子组件里关闭
            this.edit.dialogVisible = false
            this.fetchData()


            },
        }
}
</script>