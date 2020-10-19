<template>
    <div class="app-container">

        <!-- 搜索开始 -->
            <!--  :model="query" query 在 data 里已定义,v-model.trim 去掉用户输入的前后空格-->
                <el-form :inline="true" :model="query" class="demo-form-inline">
                <el-form-item label="文章标题">
                    <el-input v-model.trim="query.title" ></el-input>
                </el-form-item>
                <el-form-item label="状态">
                    <el-select v-model="query.status" placeholder="请选择状态" clearable filterable>
                    <!-- clearable 可删除 ，filterable 可搜索,:value 前面如果不加 ：就是字符串，加了就是数字-->
                    <!-- 0:已删除，1：未审核，2：审核通过，3：审核不通过 -->
                    <el-option label="已删除" :value="0"></el-option>
                    <el-option label="未审核" :value="1"></el-option>
                    <el-option label="审核通过" :value="2"></el-option>
                    <el-option label="审核不通过" :value="3"></el-option>
                   
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button icon="el-icon-search" type="primary" @click="queryData">查询</el-button>
                    <el-button icon="el-icon-refresh" @click="reload">重置</el-button>
                    <!-- <el-button icon="el-icon-circle-plus-outline" type="primary" @click="openAdd">新增</el-button> -->
                </el-form-item>
            </el-form>
        <!-- 搜索结束 -->

        <!-- 列表数据开始 -->
        <!-- align='center' 数据居中显示 -->
        <el-table :data="list" stripe border style="width: 100%">
            <el-table-column align='center' type="index" label="序号" width="80"></el-table-column>
            <el-table-column align='center' prop="title" label="文章标题" ></el-table-column>
            <el-table-column align='center' prop="viewCount" label="浏览数"></el-table-column>
            <el-table-column align='center' prop="thumhup" label="点赞数"></el-table-column>
            <el-table-column align='center' prop="ispublic" label="是否公开">
                <template slot-scope="scope">
                   <el-tag v-if="scope.row.ispublic === 0" type="warning">不公开</el-tag>
                   <el-tag v-if="scope.row.ispublic === 1" type="success">公开</el-tag>
                </template>
            </el-table-column>
            <el-table-column align='center' prop="status" label="状态">
                <!-- 使用过滤器 -->
                <template slot-scope="scope">
                    <!-- 0:已删除，1：未审核，2：审核通过，3：审核不通过 -->
                    <el-tag v-if="scope.row.status === 0" type="warning">已删除</el-tag>
                    <el-tag v-if="scope.row.status === 1" type="info">未审核</el-tag>
                    <el-tag v-if="scope.row.status === 2" type="success">审核通过</el-tag>
                    <el-tag v-if="scope.row.status === 3" type="danger">审核不通过</el-tag>
                </template>
            </el-table-column>
            <el-table-column align='center' prop="updateDate" label="更新时间"></el-table-column>
           
           <!-- 这个左对齐，要不然有些按钮没有的情况下，不好看 -->
            <el-table-column align='left' label="操作" min-width="90px">
                <!-- slot-scope="scope" 获取当前行的数据 -->
                <template slot-scope="scope">
                    <!-- 审核：只有 status === 1 才显示，其余状态不显示 -->
                    <!-- 删除：只有 status !== 0 才显示，其他不显示 -->
                    <el-button type="primary" icon="el-icon-document" circle @click="openView( scope.row.id)"></el-button>
                    <el-button v-if="scope.row.status ===1 " type="primary" icon="el-icon-check" circle @click="openAudit( scope.row.id)"></el-button>
                    <el-button v-if="scope.row.status !==0 " type="danger" icon="el-icon-delete" circle @click="handleDelete( scope.row.id)"></el-button>
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
        <audit :title="audit.title" :dialogVisible="audit.dialogVisible" :remoteClose="remoteClose" :id="audit.id" :isAudit="audit.isAudit" />

    </div>
</template>

<script>
import api from '@/api/article'
import Audit from './audit'  // 导入子组件
export default {
    name: 'Acticle', // 和对应路由表中配置的name值一致
    components: {Audit},
    data(){
        return {
            list: [], // 列表数据
            page:{
                currentPage: 1,  // 当前页码
                size: 10,  // 每页显示多少条
                total: 0, // 总记录数
            },
            query: {},// 查询条件
            audit: { // 审核子组件传递的数据
                title: "",
                dialogVisible: false,
                id: null, // 文章 id
                isAudit: true, // 打开的是否为审核窗口，true为审核，false为查看

            }
        }
    },
    created(){
        this.fetchData()
    },
    methods:{
        // 查询列表数据
        async fetchData(){
             const response = await api.getList(this.query,this.page.currentPage,this.page.size)
             // 列表数据
             this.list = response.data.records
             // 总记录数
             this.page.total = response.data.total
            },
        // 打开审核窗口
        openAudit(id){
            // 文章 id 传给子组件，子组件里调用接口
            this.audit.id = id
            // 标识为审核页面
            this.audit.isAudit = true
            this.audit.title = "审核文章"
            this.audit.dialogVisible = true

        },
        // 查看文章
        openView(id){
            this.audit.id = id  // 文章id
            this.audit.isAudit = false // 是详情页面
            this.audit.title = '文章详情'
            this.audit.dialogVisible = true 

        },
        // 删除文章
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
        // 子组件会被触发此事件关闭窗口
        remoteClose(){
            // 要在父组件里关闭，不能在子组件里关闭
            this.audit.dialogVisible = false
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
        }

}
}
</script>