<template>
<ifbp-page class="yls adjustWrap">
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
export default {
    mixins: [pagination('refreshPage'),pubDataUtils()],
    props:['pk_result'],
    mounted() {
        this.refreshPage();
    },
    data() {
        return {
            adjustInterestListData:{

            }
        }
    },
     watch: {
        pk_result() {
            this.refreshPage();
        }
    },
    methods: {
        //后台请求
        refreshPage(param) {
            debugger
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
                            {key:'source_bill',oper:'=',value:this.pk_result},
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
