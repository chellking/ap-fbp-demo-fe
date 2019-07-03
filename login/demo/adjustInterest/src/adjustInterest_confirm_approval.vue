<template>
<ifbp-page class="yls adjustWrap">
    <!--审批流程操作-->
    <div  class="approvalClass">
        <initiate-flow></initiate-flow>
    </div>
    <ifbp-main-area type="list">
      <ifbp-panel id="basePanel" title="调息详细信息" >
      <!--模板组件-->
        <ifbp-template ref="adjustInterestResult_t_ref"
                        tplId="adjustInterestList-template"
                        funnode="YlSZB022"
                        nexuskey ="confirmDetail"
                        :tplData="adjustInterestListData"
                        show-type="table">
        </ifbp-template>
      </ifbp-panel>
       <!--分页组件-->
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage" :page-sizes="pageSizes"
            :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="totalElements">
        </el-pagination>
    </ifbp-main-area>   
</ifbp-page>
</template>
<script>
import { pagination, ylsBusi,pubDataUtils } from "../../../../common/js/publicData.js";
import initiateFlow from 'ifbp-busi-element/lib/initiateFlow.vue';
export default {
    components: {
     'initiateFlow':initiateFlow
    },
    mixins: [pagination('refreshPage'),pubDataUtils()],
    mounted() {
        this.refreshPage();
    },
    data() {
        return {
            adjustInterestListData:{},
            pk_adjust_interest_result:''
        }
    },
    methods: {
        //后台请求
        refreshPage() {
            debugger
            this.pk_adjust_interest_result = this.$root.$router.currentRoute.params.id;
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
                        'custCondList': [
                            {key:'source_bill',oper:'=',value:this.pk_adjust_interest_result},
                            {key:'billstatus',oper:'=',value:'9'}
                            ]
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
                    this.$refs.adjustInterestResult_t_ref.setTableData(originalValue);
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
