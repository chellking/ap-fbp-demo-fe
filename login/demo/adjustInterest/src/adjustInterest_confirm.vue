<template>
<ifbp-page class="yls adjustWrap">
    <ifbp-breadcrumb name="调息确认"></ifbp-breadcrumb>
    <ifbp-button-area>
        <el-button type="primary" class="button-no-radius" @click="submitAdjustInterest" :disabled="isSubmit">提交</el-button>
        <el-button type="primary" class="button-no-radius" @click="adjustConfirmClick" :disabled="isClicked">审核</el-button>
        <el-button type="primary" class="button-no-radius" @click="link" >联查凭证</el-button>
        <ifbp-search class='fr adjustSearch' :template-code="searchTemplateCode" @search="handleSearch"></ifbp-search>
    </ifbp-button-area>
    <ifbp-main-area type="list">
      <!--模板组件-->
     <ifbp-template ref="adjustInterest_confirm_ref"
                    tplId="adjustInterestConfirmTemplate"
                    funnode="YlSZB022"
                    nexuskey="adjustInterestConfirm"
                    :tplData="adjustInterestListData"
                    :tplResetFun = "confirmResetFun"
                    @selection-change="tableSelectChange"
                    @search-table-click = "confirmSearchRow"
                    show-type="table">
      </ifbp-template>
       <!--分页组件-->
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage" :page-sizes="pageSizes"
            :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="totalElements">
        </el-pagination>
    </ifbp-main-area> 
      <!--开始调息确认Dialog-->
      <ifbp-dialog
        v-model="adjustDialogVisible"
        title="提示"
        @click="adjustInterestConfirm"
        @cancel-click="adjustDialogVisible = false">
      </ifbp-dialog>
      <ifbp-grandson-page ref = "grandsonConfirmRef"  title = "调息详情" style = "width:100%" :modal="true">
        <adjustInterest-confirm-detail ref = "adjustInterestConfirmDetail" :pk_result = "pk_adjust_interest_result">
        </adjustInterest-confirm-detail>
      </ifbp-grandson-page>
</ifbp-page>
</template>
<script>
import { pagination, ylsBusi, pubDataUtils } from "../../../../common/js/publicData.js";
import { linkVoucher } from "../../../../common/js/voucher.js";
import adjustInterestConfirmDetail from "./adjustInterest_confirm_detail.vue";
export default {
    mixins: [pagination('refreshPage'),pubDataUtils()],
    components: {
        adjustInterestConfirmDetail : adjustInterestConfirmDetail
    },
    data() {
        return {
            searchTemplateCode: 'QUERY_ADJUST_CONFIRM',
            adjustInterestListData:{},
            adjustDialogVisible:false,
            isClicked:true,
            operData:null,
            isSubmit: true,
            pk_adjust_interest_result:"",
            //操作按钮
            confirmResetFun($node){
                //获取table,此id为ui模板上面的表格Id
                let $table = $node.find("el-table");
                //定义操作
                let operateArr = [
                    {
                        title:"查看 ",
                        icon: 'search',
                    }
                ];
                //获取操作按钮html片段
                let operateHtml = this.getTableOperateHtml(operateArr);
                $table.append(operateHtml);
                return $node[0].outerHTML;
            }
        }
    },
    mounted() {
        this.refreshPage();
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
        //按钮控制
        tableSelectChange(selection){
            this.isClicked = true;
            if(Object.prototype.toString.call(selection) === '[object Array]'){
                if(selection.length == 1 && (selection[0].billstatus === '20' || selection[0].billstatus === '36')){
                    this.isClicked = true;
                    this.operData = selection[0];
                    this.isSubmit = false;
                }else if(selection[0].billstatus === '204' ){
                    this.isClicked = false;
                    this.operData= null;
                    this.isSubmit = true;
                }else{
                    this.operData= null;
                }
            }
        },
        //查看调息数据详情
        confirmSearchRow: function(scope) {
            this.pk_adjust_interest_result = scope.row.pk_adjust_interest_result; 
            this.$refs.grandsonConfirmRef.showPage();
        },
        link(){
            debugger;
            let tableSelections = this.$refs.adjustInterest_confirm_ref.getTableComp().getSelection();
            if(tableSelections && tableSelections.length == 1){
                linkVoucher(this,tableSelections[0].pk_adjust_interest_result);
            }else{
                this.$message({
                    message: "请选择一条记录",
                    type: "error"
                });
            }
        },
        //确认校验及弹出
        adjustConfirmClick(){
            let final_sum_finish = this.operData.final_sum_finish;//最终调息数
            let plan_adjust_sum = this.operData.plan_adjust_sum;//应调息数
            if(final_sum_finish === plan_adjust_sum){
                this.adjustDialogVisible = true;
            }else{
                this.$message({message: "请完成所有调息后，再点击审核！",type: "error"});
            }
        },
        //确定
        adjustInterestConfirm(){
            this.adjustDialogVisible=false;
            let tableData = this.$refs.adjustInterest_confirm_ref.getTableData();
            let operIndex = tableData.indexOf(this.operData);
            this.clearPackDataFun(this.operData);
            this.$http({
                url: ylsBusi + "contr/adjust/interestResult/check" ,
                headers: {'Content-Type': 'application/json'},  
                method: "post",
                data:this.operData
            }).then(res => {
                if (res.data.success == true) {
                    let originalValue = res.data.data;
                    this.pubPackDataFun(originalValue);
                    this.adjustInterestListData.AdjustInterestResultEntity_t.splice(operIndex,1,originalValue);
                    this.operData = null;
                    this.$message({
                        message: "审核成功！",   
                        type: "success"
                    });
                }else{
                    this.$message({
                        message: res.data.error.errorMessage,
                        type: "error"
                    });
                }
            }).catch(e => {
                this.$message({
                    message: "操作失败！",
                    type: "error"
                });
            });
        },
        //提交
        submitAdjustInterest() {
            let tableSelections = this.$refs.adjustInterest_confirm_ref
            .getTableComp()
            .getSelection();
            if (tableSelections && tableSelections.length == 1) {
                    let data = tableSelections[0];
                    if(data.billstatus !=='20' && data.billstatus !=='36'){
                        this.$message({
                            message: "该数据单据状态为非暂存状态，不可以进行提交操作！",
                            type: "error"
                        });
                        return;
                    }
                    this.clearPackDataFun(data);
                    this.$http({
                        url:ylsBusi+"contr/adjust/interestResult/submit",
                        headers: { "Content-Type": "application/json" },
                        method: "post",
                        dataType: "json",
                        data: data
                    }).then(res => {
                        if (res.data.success === true) {
                            this.$message({
                                message: "提交成功！",
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
                            message: "提交失败！",
                            type: "error"
                        });
                    });
                this.refreshPage();
            } else {
                this.$message({
                    message: "请选择一条数据！",
                    type: "error"
                });
            }
        },
        //审核操作
        // checkAdjustInterest(){
        //     let tableSelections = this.$refs.adjustInterest_confirm_ref
        //     .getTableComp()
        //     .getSelection();
        //     if (tableSelections && tableSelections.length == 1) {
        //             let data = tableSelections[0];
        //             if(data.billstatus !== '204'){
        //                 this.$message({
        //                     message: "只有审核中的数据才能进行审核操作！",
        //                     type: "error"
        //                 });
        //                 return;
        //             }
        //         this.checkDialogVisible = true;
        //     } else {
        //         this.$message({
        //         message: "请选择一条数据！",
        //         type: "error"
        //         });
        //     }
        // },
        // //审核通过
        // checkConfirmTrueClick(){
        //     let tableSelections = this.$refs.adjustInterest_confirm_ref
        //     .getTableComp()
        //     .getSelection();
        //     if (tableSelections && tableSelections.length == 1) {
        //             let data = tableSelections[0];
        //             this.clearPackDataFun(data);
        //             this.$http({
        //                 url:ylsBusi+"contr/adjust/interestResult/check",
        //                 headers: { "Content-Type": "application/json" },
        //                 method: "post",
        //                 dataType: "json",
        //                 data: data
        //             }).then(res => {
        //                 if (res.data.success === true) {
        //                     this.$message({
        //                         message: "审核已通过!",
        //                         type: "success"
        //                     });
        //                 this.refreshPage();
        //                 } else {
        //                     this.$message({
        //                         message: res.data.error.errorMessage,
        //                         type: "error"
        //                     });
        //                 }
        //             }).catch(e => {
        //                 this.checkDialogVisible = false;
        //                     this.$message({
        //                     message: "操作失败！",
        //                     type: "error"
        //                 });
        //             });
        //         }
        //         this.checkDialogVisible = false;
        // },
        // //审核不通过
        // checkConfirmFalseClick(){
        //     let tableSelections = this.$refs.adjustInterest_confirm_ref
        //     .getTableComp()
        //     .getSelection();
        //     if (tableSelections && tableSelections.length == 1) {
        //             let datam = tableSelections[0];
        //             this.clearPackDataFun(datam);
        //             this.$http({
        //                 url:ylsBusi+"contr/adjust/interestResult/unPass",
        //                 headers: { "Content-Type": "application/json" },
        //                 method: "post",
        //                 dataType: "json",
        //                 data: datam
        //             }).then(res => {
        //                 if (res.data.success === true) {
        //                     this.$message({
        //                         message: "操作成功!",
        //                         type: "success"
        //                     });
                            
        //                 } else {
        //                     this.$message({
        //                         message: res.data.error.errorMessage,
        //                         type: "error"
        //                     });
        //                 }
        //             }).catch(e => {
        //                 this.checkDialogVisible = false;
        //                     this.$message({
        //                     message: "操作失败！",
        //                     type: "error"
        //                 });
        //             });
        //         this.checkDialogVisible = false;
        //         this.refreshPage();
        //     }  
        // },
        //后台请求
        refreshPage() {
            let url = ylsBusi + 'contr/adjust/interestResult/page'
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
                        'qtAggVO':this.sp
                    }
                }
            };
            this.$http.post(url, data).then(res => {
                // UI模板表格名称
                if (res.data.success == true) {
                    let originalValue = res.data.data.content;
                    this.pubPackDataFun(originalValue);
                    this.$refs.adjustInterest_confirm_ref.setTableData(originalValue);
                    this.totalElements = res.data.data.totalElements;
                }else{
                    this.$message({
                        message: res.data.error.errorMessage,
                        type: "error"
                    });
                }
            }).catch((e) => {
                this.$message({
                    message: '查询失败!',
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
