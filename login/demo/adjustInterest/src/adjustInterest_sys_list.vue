<template>
<ifbp-page class="yls adjustWrap">
    <ifbp-breadcrumb name="系统调息"></ifbp-breadcrumb>
    <ifbp-button-area>
        <el-button type="primary" class="button-no-radius" @click="adjustInterestStart">加载调息</el-button>
        <el-button type="primary" class="button-no-radius" @click="adjustInterestBatch" :disabled="isAdjust">调息</el-button>
        <el-button type="primary" class="button-no-radius" @click="submitAdjustInterest" :disabled="isSubmit">提交</el-button>
        <el-button type="primary" class="button-no-radius" @click="checkAdjustInterest" :disabled="isClicked">审核</el-button>
        <el-button type="primary" class="button-no-radius" @click="adjustInterestDownload">批量下载</el-button>

        <ifbp-search class='fr adjustSearch' :template-code="searchTemplateCode" @search="handleSearch"></ifbp-search>
    </ifbp-button-area>
    <ifbp-main-area type="list">
      <!--模板组件-->
     <ifbp-template ref="adjustInterest_t_ref"
                    tplId="adjustInterestList-template"
                    funnode="YlSZB022"
                    nexuskey ="adjustInterest_basicInfo"
                    :tplData="adjustInterestListData"
                    show-type="table"
                    :tplResetFun="templateTableFormResetFun"
                    @selection-change="tableSelectChange"
                    @search-table-click="tableSearchClick"
                    @right-table-click="toHandAdjustInterest"
                    @delete-table-click="showDelDialog">
      </ifbp-template>
       <!--分页组件-->
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage" :page-sizes="pageSizes"
            :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="totalElements">
        </el-pagination>
    </ifbp-main-area> 
      <!--删除确认Dialog-->
       <ifbp-del-dialog
        v-model="delDialogVisible"
        title="删除操作"
        message="确认删除该数据？删除后无法恢复。"
        @click="deleteClick"
        @cancel-click="deleteCancelClick"
        >
      </ifbp-del-dialog>
       <!--审核Dialog-->
        <el-dialog
        title="提示"
        v-model="checkDialogVisible"
        @update:visible="val => checkDialogVisible = val"
        :modal="true"
        size="tiny">
        <span slot="footer" class="dialog-footer">
            <el-button type="primary" @click="checkConfirmTrueClick">审核通过</el-button>
            <el-button type="primary" @click="opinion">审核不通过</el-button>
        </span>
       </el-dialog>
       
       <el-dialog :title="审批意见" v-model="dialogFormVisible" size="tiny">
          <div slot="footer" class="dialog-footer">
            <el-button @click="checkCancelClick">取 消</el-button>
            <el-button type="primary" @click="checkConfirmFalseClick">确 定</el-button>
          </div>
          <template>
            <el-form label-position="left">
              <el-form-item label="审批意见：" :label-width="formLabelWidth">
                <el-input type="textarea" v-model="opinions" :rows="2" placeholder="请输入审批意见"></el-input>
              </el-form-item>
            </el-form>
          </template>
        </el-dialog>
</ifbp-page>
</template>
<script>
import { pagination, ylsBusi,pubDataUtils } from "../../../../common/js/publicData.js";
export default {
    mixins: [pagination('refreshPage'),pubDataUtils()],
    mounted() {
        this.refreshPage();
        this.getPermiss();
    },
    data() {
        return {
            searchTemplateCode: 'QUERY_ADJUST_INTEREST',
            adjustInterestListData:{},
            adjustType:'system',
            //删除对话框
            delDialogVisible: false,
            //审核对话框
            checkDialogVisible:false,
            dialogFormVisible:false,
            opinions: "",
            isPermiss:0,
            //待删除数据id
            delId:'',
            deletingIndex: null,
            isSubmit: true,
            isClicked: true,
            isAdjust:false,
            //操作按钮
            templateTableFormResetFun($node){
                //获取table,此id为ui模板上面的表格Id
                let $table = $node.find("el-table");
                //定义操作
                let operateArr = [
                    {
                        title:"查看 ",
                        icon: 'search',
                    },
                    {
                        title:'删除',
                        icon:'delete',
                        vif:"scope.row.billstatus ==='20'||scope.row.billstatus ==='36'||scope.row.billstatus ==='8'"
                    },
                    {
                        title:'转手工调息',
                        icon:'right',
                        vif:"scope.row.billstatus ==='20'"
                    }
                ];
                //获取操作按钮html片段
                let operateHtml = this.getTableOperateHtml(operateArr);
                $table.append(operateHtml);
                return $node[0].outerHTML;
            }
        }
    },
    methods: {
       // 高级搜索
        handleSearch(searchTemplate) {
            this.searchParameters = JSON.stringify(searchTemplate);
            if(searchTemplate!==''){
                this.sp = JSON.stringify(searchTemplate);
            }
            this.refreshPage();
        },
        //查看操作
        tableSearchClick(scope) {
            this.$router.push('/adjustInterest/adjustInterest_sys_detail/'+scope.row.pk_adjust_interest);
        },
        //按钮控制
        tableSelectChange(selection){
            if (selection) {
                debugger;
                for (let i = 0; i < selection.length; i++) {
                    if (selection[i].adjust_status !=='ADJUST_EXECUTING') {
                        this.isSubmit = true;
                        this.isClicked = true;
                        this.isAdjust = false;
                        return;
                    } else if (selection[i].billstatus === '20' || selection[i].billstatus === '36') {
                        this.isClicked = true;
                        this.isAdjust = false;
                        this.isSubmit = false;
                        return;
                    } else if (selection[i].billstatus === '204') {
                        this.isSubmit = true;
                        this.isAdjust = true;
                        if(this.isPermiss === 3 || (this.isPermiss === 1 && selection[i].busi_type==='MARKETBUSI') || (this.isPermiss === 2 && selection[i].busi_type==='HIGHENDBUSI')){
                            this.isClicked = false;
                        }else{
                            this.isClicked = true;
                        }
                        return;
                    }
                }
            } 
            this.isSubmit = true;
            this.isClicked = true;
            this.isAdjust = false;  
        },

        //删除操作
        showDelDialog(scope){
        this.deletingIndex = scope.$index;
        this.delId = scope.row.pk_adjust_interest;
        this.delDialogVisible = true;
        },
        //删除取消
        deleteCancelClick(){
        this.delDialogVisible = false;
        },
        //删除确定
        deleteClick(){
            this.$http({
                url: ylsBusi + 'contr/adjust/interest/deleteById',
                headers: { 'Content-Type': 'application/json' },
                method: 'post',
                data: this.delId
            }).then(res => {
                if (res.data.success === true) {
                    this.$message({
                        message: '删除成功!',
                        type: 'success',
                    });
                    this.delDialogVisible = false;
                    this.adjustInterestListData.adjustInterest_t.splice(this.deletingIndex, 1)
                    this.totalElements--;
                } else {
                    this.$message({
                    message: res.data.error.errorMessage,
                    type: "error",
                    });
                }
            }).catch((e) => {
                this.$message({
                    message: '删除失败！',
                    type: 'error',
                });
            });
        },
        //提交
        submitAdjustInterest() {
            let tableSelections = this.$refs.adjustInterest_t_ref
            .getTableComp()
            .getSelection();
            
            if (tableSelections && tableSelections.length > 0) {
                for (let i = 0; i < tableSelections.length; i++) {
                    let data = tableSelections[i];
                    if(data.billstatus !=='20' && data.billstatus !=='36'){
                        this.$message({
                            message: "该数据单据状态为非暂存状态，不可以进行提交操作！",
                            type: "error"
                        });
                        return;
                    }
                    this.clearPackDataFun(data);
                    this.$http({
                        url:ylsBusi+"contr/adjust/interest/submit",
                        headers: { "Content-Type": "application/json" },
                        method: "post",
                        dataType: "json",
                        data: data
                    }).then(res => {
                        if (res.data.success === true) {
                            // this.$message({
                            //     message: "提交成功！",
                            //     type: "success"
                            // });
                            
                        } else {
                            this.$message({
                                message: res.data.error.errorMessage,
                                type: "error"
                            });
                        }
                    }).catch(e => {
                        this.$message({
                            message: "提交失败！",
                            type: "error"
                        });
                    });
                }
                this.refreshPage();
                this.$message({
                    message: "提交完成！",
                    type: "success"
                });
            } else {
                this.$message({
                    message: "请选择一条数据！",
                    type: "error"
                });
            }
        },
        //审核操作
        checkAdjustInterest(){
            let tableSelections = this.$refs.adjustInterest_t_ref
            .getTableComp()
            .getSelection();
            if (tableSelections && tableSelections.length > 0) {
                for (let i = 0; i < tableSelections.length; i++) {
                    let data = tableSelections[i];
                    if(data.billstatus !== '204'){
                        this.$message({
                            message: "只有审核中的数据才能进行审核操作！",
                            type: "error"
                        });
                        return;
                    }
                    
                }
                this.checkDialogVisible = true;
            } else {
                this.$message({
                message: "请选择一条数据！",
                type: "error"
                });
            }
        },
        //审核通过
        checkConfirmTrueClick(){
            let tableSelections = this.$refs.adjustInterest_t_ref
            .getTableComp()
            .getSelection();
            if (tableSelections && tableSelections.length > 0) {
                for (let i = 0; i < tableSelections.length; i++) {
                    let data = tableSelections[i];
                    this.clearPackDataFun(data);
                    this.$http({
                        url:ylsBusi+"contr/adjust/interest/check",
                        headers: { "Content-Type": "application/json" },
                        method: "post",
                        dataType: "json",
                        data: data
                    }).then(res => {
                        if (res.data.success === true) {
                            this.$message({
                                message: "审核已通过!",
                                type: "success"
                            });
                        this.refreshPage();
                        } else {
                            this.$message({
                                message: res.data.error.errorMessage,
                                type: "error"
                            });
                        }
                    }).catch(e => {
                        this.checkDialogVisible = false;
                            this.$message({
                            message: "操作失败！",
                            type: "error"
                        });
                    });
                }
                this.checkDialogVisible = false;
            }
            
        },
        opinion() {
            this.checkDialogVisible= false;
            this.dialogFormVisible = true;
        },
        checkCancelClick(){
            this.dialogFormVisible = false;
            this.checkDialogVisible= true;
            this.opinions = '';
        },
        //审核不通过
        checkConfirmFalseClick(value){
            let tableSelections = this.$refs.adjustInterest_t_ref
            .getTableComp()
            .getSelection();
            // let ids = [];
            // if (tableSelections && tableSelections.length > 0) {
            //     for (let i = 0; i < tableSelections.length; i++) {
            //         ids[i] = tableSelections[i].pk_adjust_interest;
            //     }
            // }
            if (tableSelections && tableSelections.length > 0) {
                for (let i = 0; i < tableSelections.length; i++) {
                    tableSelections[i].def1 = this.opinions;
                    let datam = tableSelections[i];
                    this.clearPackDataFun(datam);
                    this.$http({
                        url:ylsBusi+"contr/adjust/interest/unPass",
                        headers: { "Content-Type": "application/json" },
                        method: "post",
                        dataType: "json",
                        data: datam
                    }).then(res => {
                        if (res.data.success === true) {
                            this.$message({
                                message: "操作成功!",
                                type: "success"
                            });
                            this.refreshPage();
                        } else {
                            this.$message({
                                message: res.data.error.errorMessage,
                                type: "error"
                            });
                        }
                    }).catch(e => {
                        this.checkDialogVisible = false;
                            this.$message({
                            message: "操作失败！",
                            type: "error"
                        });
                    });
                }
                this.checkDialogVisible = false;
                this.dialogFormVisible = false;
                this.opinions = '';
            }
        },
        //加载调息
        adjustInterestStart(){
            this.$http({
                url:ylsBusi+"contr/adjust/interest/startSysAdjust",
                headers: { "Content-Type": "application/json" },
                method: "post",
                dataType: "json",
                data:this.adjustType
            }).then(res => {
                if (res.data.success === true) {
                    this.refreshPage();
                    this.$message({
                        message: "加载调息完成!",
                        type: "success"
                    });
                } else {
                    this.$message({
                        message: res.data.error.errorMessage,
                        type: "error"
                    });
                }
            }).catch(e => {
                this.$message({
                message: "加载调息失败，未知异常！",
                type: "error"
                });
            });
        },
    
        //调息
        adjustInterestBatch(){
            let ids = [];
            let tableSelections = this.$refs.adjustInterest_t_ref.getTableComp().getSelection();
            if (tableSelections && tableSelections.length > 0) {
                tableSelections.forEach((item, index) => {
                    if(item.billstatus !== '20'){
                        this.$message({
                            message: "只能选择单据状态为暂存的单据！",
                            type: "error"
                        });
                        return;
                    }
                    ids[index] = item.pk_adjust_interest;
                });
            if(ids.length > 0){
                this.adjustBatchOperate(ids);
            }else{
                this.$message({
                    message: "没有可供发起调息的单据！",
                    type: "error"
                });
            }               
            } else {
                this.$http({
                url:ylsBusi+"contr/adjust/interest/getOKAdjustInterest",//后台方法
                headers: { "Content-Type": "application/json" },
                method: "post",
                dataType: "json",
            }).then(res => {
                if (res.data.success === true) {
                    if(res.data.data.length>0){
                        res.data.data.forEach((item, index)=>{
                          ids[index] = item;
                        });
                    }
                    if(ids.length > 0){
                        this.adjustBatchOperate(ids);
                    }else{
                        this.$message({
                            message: "没有可供发起调息的单据！",
                            type: "error"
                        });
                    }
                } else {
                    this.$message({
                        message: res.data.error.errorMessage,
                        type: "error"
                    });
                }
            }).catch(e => {
                this.$message({
                    message: "批量调息获取主键失败",
                    type: "error"
                });
            }); 
            
                // tableSelections = this.$refs.adjustInterest_t_ref.getTableData();
                // tableSelections.forEach((item, index) => {
                //     if(item.billstatus === '20'){
                //         ids[index] = item.pk_adjust_interest;
                //     }
                // });
            }
        },
        //批量调息操作
        adjustBatchOperate(ids){
            this.$http({
                url:ylsBusi+"contr/adjust/interest/adjustBatchPk",//后台方法
                headers: { "Content-Type": "application/json" },
                method: "post",
                dataType: "json",
                data: ids
            }).then(res => {
                if (res.data.success === true) {
                    this.$message({
                        message: "批量调息操作成功！",
                        type: "success"
                    });
                    this.refreshPage();
                } else {
                    this.$message({
                        message: res.data.error.errorMessage,
                        type: "error"
                    });
                }
            }).catch(e => {
                this.$message({
                    message: "批量调息操作失败！",
                    type: "error"
                });
            });        
        },
        //批量下载
        adjustInterestDownload(){
            let tableSelections = this.$refs.adjustInterest_t_ref.getTableComp().getSelection();
            let ids = [];
            if (tableSelections && tableSelections.length > 0) {
                tableSelections.forEach((item, index) => {
                    if(item.billstatus !== '9'){
                        return;
                    }
                    ids[index] = item.pk_adjust_interest;
                });
                let selects = '';
                for(let i =0;i<ids.length;i++){
                    if(i>0){
                    selects+=',';
                    }
                    selects+=ids[i];
                }
                if(selects.length != 0){
                    window.open('/yls-busi-web/contr/adjust/interest/toNoteDownload?pks='+selects);//下载地址
                 this.$message({
                        message: "审核通过的数据已下载完成！",
                        type: "success"
                    });
                }else{
                    this.$message({
                            message: "请先选择已审核通过的数据！",
                            type: "error"
                        });
                }
            } else {
                this.$message({
                    message: "请选择需要下载的数据！",
                    type: "error"
                });
            }   
        },

        //转手工，暂存状态
        toHandAdjustInterest(scope){
            this.deletingIndex = scope.$index;
            let item = scope.row;
            this.clearPackDataFun(item);
            this.$http({
                url:ylsBusi+"contr/adjust/interest/changeToHand",//后台方法
                headers: { "Content-Type": "application/json" },
                method: "post",
                dataType: "json",
                data: item
            }).then(res => {
                if (res.data.success === true) {
                    this.$message({
                        message: "转手工调息操作成功！",
                        type: "success"
                    });
                    this.adjustInterestListData.adjustInterest_t.splice(this.deletingIndex, 1);
                    this.deletingIndex = "";
                    this.totalElements--;
                } else {
                    this.$message({
                        message: res.data.error.errorMessage,
                        type: "error"
                    });
                }
            }).catch(e => {
                this.$message({
                    message: "转手工调息操作失败！",
                    type: "error"
                });
            });        
        },
        getPermiss(){
            let url = ylsBusi + 'contr/adjust/interest/isAuditPermiss';
            this.$http({
                url:url,
                headers: { "Content-Type": "application/json" },
                method: "post",
                dataType: "json",
            }).then(res => {
                debugger;
                this.isPermiss = res.data;
            }).catch((e) => {
                console.log("审核权限获取失败"+e);
            });
        },
        //后台请求
        refreshPage() {
            let url = ylsBusi + 'contr/adjust/interest/page';
            let data = {
                "orderList": [
                    {
                        "direction": "desc",
                        "property": "ts"
                    }
                ],
                'pageNum': this.currentPage - 1,
                'pageSize': this.pageSize,
                "searchParams": {
                    "searchMap": {
                        'custCondList': [{key:'adjust_type',oper:'=',value:'system'}],
                        'qtAggVO':this.sp
                    }
                }
            };
            this.$http({
                url:url,
                headers: { "Content-Type": "application/json" },
                method: "post",
                dataType: "json",
                data: data
            }).then(res => {
                if (res.data.success === true) {
                    // UI模板表格名称
                    let originalValue = res.data.data.content;
                    this.pubPackDataFun(originalValue);
                    this.$refs.adjustInterest_t_ref.setTableData(originalValue);
                    this.totalElements = res.data.data.totalElements;
                }else {
                    this.$message({
                        message: res.data.error.errorMessage,
                        type: "error"
                    });
                }
            }).catch((e) => {
                console.log(e);
                this.$message({
                    message: '信息获取失败！',
                    type: 'error',
                });
            });
                 
        }
   }
};
</script>
// 下面标签不可加scoped;
<style>
    .yls.adjustWrap .adjustSearch .el-input{
        visibility: hidden;
    }
</style>
