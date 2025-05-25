<template>
    <el-row style="background-color: #FFFFFF;padding: 5px 0;border-radius: 5px;">
        <el-row style="padding: 10px;margin-left: 5px;">
            <el-row>
                <el-input size="small" style="width: 216px;" v-model="categoryQueryDto.name" placeholder="Category Name" clearable
                    @clear="handleFilterClear">
                    <el-button slot="append" @click="handleFilter" icon="el-icon-search"></el-button>
                </el-input>
                <span style="float: right;" class="edit-button" @click="add()">
                    Add Category
                </span>
            </el-row>
        </el-row>
        <el-row style="margin: 0 22px;border-top: 1px solid rgb(245,245,245);">
            <el-table :stripe="true" :data="tableData" style="width: 100%">
                
                <el-table-column prop="id" width="88" label="ID"></el-table-column>
                <el-table-column prop="name" label="Category Name"></el-table-column>
                <el-table-column prop="isUse" width="168" label="Availibility">
                    <template slot-scope="scope">
                        <span>{{ scope.row.isUse ? 'Active' : 'Inactive'}}</span>
                    </template>
                </el-table-column>
                <el-table-column label="Operation" width="120">
                    <template slot-scope="scope">
                        <span class="text-button" @click="handleEdit(scope.row)">Edit</span>
                        <span class="text-button" @click="handleDelete(scope.row)">Delete</span>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination style="margin:10px 0;float: right;" @size-change="handleSizeChange"
                @current-change="handleCurrentChange" :current-page="currentPage" :page-sizes="[10, 20]"
                :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper"
                :total="totalItems"></el-pagination>
        </el-row>
        <!-- 操作面板 -->
        <el-dialog :show-close="false" :visible.sync="dialogCategoryOperaion" width="18%">
            <div style="padding:16px 20px;">
                <el-row>
                    <p>*Category Name</p>
                    <input class="dialog-input" v-model="data.name" placeholder="Name" />
                </el-row>
                <el-row>
                    <p>*Category Availability</p>
                    <el-switch v-model="data.isUse" active-text="active" inactive-text="inactive">
                    </el-switch>
                </el-row>
            </div>
            <span slot="footer" class="dialog-footer" style="margin-top: 10px;">
                <span class="channel-button" @click="cannel()">
                    Cancel
                </span>
                <span v-if="!isOperation" class="edit-button" @click="addOperation()">
                    Confirm
                </span>
                <span v-else class="edit-button" @click="updateOperation()">
                    Confirm Update
                </span>
            </span>
        </el-dialog>
    </el-row>
</template>

<script>
export default {
    data() {
        return {
            data: {},
            currentPage: 1,
            pageSize: 10,
            totalItems: 0,
            dialogCategoryOperaion: false, // 开关
            isOperation: false, // 开关-标识新增或修改
            tableData: [],
            delectedRows: [],
            categoryQueryDto: {}, // 搜索条件
        };
    },
    created() {
        this.fetchFreshData();
    },
    methods: {
        cannel() {
            this.data = {};
            this.dialogCategoryOperaion = false;
            this.isOperation = false;
        },
        // 批量删除数据
        async batchDelete() {
            if (!this.delectedRows.length) {
                this.$message(`未选中任何数据`);
                return;
            }
            const confirmed = await this.$swalConfirm({
                title: '删除Category数据',
                text: `删除后不可恢复，是否继续？`,
                icon: 'warning',
            });
            if (confirmed) {
                try {
                    let ids = this.delectedRows.map(entity => entity.id);
                    const response = await this.$axios.post(`/category/batchDelete`, ids);
                    if (response.data.code === 200) {
                        this.$notify({
                            duration: 1000,
                            title: '信息删除',
                            message: '删除成功',
                            type: 'success'
                        });
                        this.fetchFreshData();
                        return;
                    }
                } catch (error) {
                    this.$message.error("Category信息删除异常：", error);
                    console.error(`Category信息删除异常：`, error);
                }
            }
        },
        // 修改信息
        updateOperation() {
            // category/update --- post
            // console.log("Submitting category:", this.data);
            this.$axios.put('/category/update', this.data).then(res => {
                const { data } = res;
                if (data.code === 200) {
                    this.$notify.success({
                        duration: 1000,
                        title: 'Update Operation',
                        message: data.msg
                    });
                    this.fetchFreshData();
                    this.cannel();
                }
            }).catch(error => {
                this.$notify.error({
                    title: 'Update Operation',
                    message: error
                });
            });
        },
        /**
         * add new product
         */
        async addOperation() {
            //use category api to add
            // /category/save --- POST mapping
            // console.log("Submitting category:", this.data);
            this.$axios.post('/category/save', this.data).then(res => {
                const { data } = res;
                if (data.code === 200) {
                    this.$notify.success({
                        duration: 1000,
                        title: 'Add Operation',
                        message: data.msg
                    });
                    this.fetchFreshData();
                    this.cannel();
                } else {
                    this.$notify.info({
                        duration: 1000,
                        title: 'Add Operation',
                        message: data.msg
                    });
                }
            }).catch(error => {
                this.$notify.error({
                    title: 'Add Operation',
                    message: error
                });
            });

        },
        async fetchFreshData() {
            try {
                let startTime = null;
                let endTime = null;
                if (this.searchTime != null && this.searchTime.length === 2) {
                    const [startDate, endDate] = await Promise.all(this.searchTime.map(date => date.toISOString()));
                    startTime = `${startDate.split('T')[0]}T00:00:00`;
                    endTime = `${endDate.split('T')[0]}T23:59:59`;
                }
                // 请求参数
                const params = {
                    current: this.currentPage,
                    size: this.pageSize,
                    startTime: startTime,
                    endTime: endTime,
                    ...this.categoryQueryDto
                };
                const response = await this.$axios.post('/category/query', params);
                const { data } = response;
                this.tableData = data.data;
                this.totalItems = data.total;
            } catch (error) {
                this.$message.error("查询Category信息异常:", error);
                console.error('查询Category信息异常:', error);
            }
        },
        add() {
            this.dialogCategoryOperaion = true;
        },
        handleFilter() {
            this.currentPage = 1;
            this.fetchFreshData();
        },
        handleFilterClear() {
            this.handleFilter();
        },
        handleSizeChange(val) {
            this.pageSize = val;
            this.currentPage = 1;
            this.fetchFreshData();
        },
        handleCurrentChange(val) {
            this.currentPage = val;
            this.fetchFreshData();
        },
        handleEdit(row) {
            this.dialogCategoryOperaion = true;
            this.isOperation = true;
            row.userPwd = null;
            this.userAvatar = row.userAvatar;
            this.data = { ...row }
        },
        handleDelete(row) {
            this.delectedRows.push(row);
            this.batchDelete();
        }
    },
};
</script>
<style scoped lang="scss"></style>