<template>
<!-- 广告管理 -->
    <div class="app-container">

        <!-- 搜索开始 -->
            <!--  :model="query" query 在 data 里已定义,v-model.trim 去掉用户输入的前后空格-->
                <el-form :inline="true" :model="query" class="demo-form-inline">
                <el-form-item label="广告标题">
                    <el-input v-model.trim="query.title" ></el-input>
                </el-form-item>
                <el-form-item label="状态">
                    <el-select v-model="query.status" placeholder="请选择状态" clearable filterable>
                    <!-- clearable 可删除 ，filterable 可搜索,:value 前面如果不加 ：就是字符串，加了就是数字-->
                    <el-option label="正常" :value="1"></el-option>
                    <el-option label="禁用" :value="0"></el-option>
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
            <el-table-column align='center' prop="title" label="广告标题" ></el-table-column>
            <el-table-column align='center' prop="imageUrl" label="广告图片">
                <template slot-scope="scope">
                    <!-- 使用 element ui 提供的 image 组件 -->
                    <!-- 可通过 previewSrcList 开启预览大图的功能。 -->
                    <!-- :preview-src-list="[scope.row.imageUrl]" 接收的是个数组，如果大于 1 个图片，可以左右切换 -->
                    <el-image 
                        style="width: 90px; height: 90px"
                        :src="scope.row.imageUrl" 
                        :preview-src-list="[scope.row.imageUrl]">
                    </el-image>
                </template>
            </el-table-column>
            <el-table-column align='center' prop="advertUrl" label="广告链接"></el-table-column>
            <el-table-column align='center' prop="status" label="状态">
                
                <template slot-scope="scope">
                   <el-tag v-if="scope.row.status === 0" type="warning">禁用</el-tag>
                   <el-tag v-if="scope.row.status === 1" type="success">正常</el-tag>
                </template>
            </el-table-column>
            <el-table-column align='center' prop="sort" label="排序"></el-table-column>
            <el-table-column align='center' prop="updateDate" label="更新时间"></el-table-column>
           
            <el-table-column align='left' label="操作" min-width="90px">
                <!-- slot-scope="scope" 获取当前行的数据 -->
                <template slot-scope="scope">
                    <el-button  type="primary" icon="el-icon-edit" circle @click="handleEdit( scope.row)"></el-button>
                    <el-button  type="danger" icon="el-icon-delete" circle @click="handleDelete( scope.row.id)"></el-button>
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
            <edit :title="edit.title" :dialogVisible="edit.dialogVisible" :formData="edit.formData" :oldImageUrl="edit.oldImageUrl" :remoteClose="remoteClose"></edit>
        
    </div>
</template>
<script>
import api from '@/api/advert'
import Edit from './edit'
export default {
    name: 'Advert', // 和对应路由表中配置的name值一致
    components: {Edit},
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
                oldImageUrl: null,  // 编辑时，查询出来的原始数据
                formData:{// 提交的表单数据
                    id: null,
                    title:"",
                    imageUrl: "",
                    advertUrl: "",
                    advertTarget:"",
                    status:"",
                    position:"",
                    sort: null,
            }
            }
    
        }
    },
    created(){
        this.fetchData()
    },
    methods:{
        async fetchData(){ // 查询列表数据
            const response = await api.getList(this.query,this.page.currentPage,this.page.size)
            // 列表数据
            this.list = response.data.records
            // 总记录数
            this.page.total = response.data.total
        },
        // 编辑
        handleEdit(data){
            console.log(data)
            this.edit.formData = data
            this.edit.oldImageUrl = data.imageUrl  // 修改前的 url
            this.edit.tiele = '编辑'
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

        // 新增
        openAdd(){
            this.edit.formData = { // 不写会导致编辑后，在新增，输入框内容没有清空
                    id: null,
                    title:"",
                    imageUrl: "",
                    advertUrl: "",
                    advertTarget:"",
                    status:"",
                    position:"",
                    sort: null,
            }
            this.edit.dialogVisible = true
            this.edit.title = "新增"

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
        // 子组件会被触发此事件关闭窗口
        remoteClose(){
            // 关闭弹框了，将数据置为空
            this.edit.formData = {
                    id: null,
                    title:"",
                    imageUrl: "",
                    advertUrl: "",
                    advertTarget:"",
                    status:"",
                    position:"",
                    sort: null,
            }
            // 要在父组件里关闭，不能在子组件里关闭
            this.edit.dialogVisible = false
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
    }
}
</script>