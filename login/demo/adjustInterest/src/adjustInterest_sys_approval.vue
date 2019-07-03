<template>
  <ifbp-page>
    <ifbp-breadcrumb name="系统调息审批详情"></ifbp-breadcrumb>
    <!--审批流程操作-->
    <div  class="approvalClass">
         <initiate-flow></initiate-flow>
    </div>
    <ifbp-main-area type="detail">
    <ifbp-panel-group :navbar="true"> 
      <ifbp-panel id="AdjustInterestBasicPanel" title="调息信息" >
          <ifbp-template ref="adjustInterestBasic_ref"
                        tplId="adjustInterestBasicTemplate"
                        :tplData="AdjustInterestBasicData"
                        funnode="YlSZB022"
                        nexuskey ="adjustInterest_basicInfo"
                        :editable=false
                        show-type="form" 
                        >
          </ifbp-template>
        </ifbp-panel>

      <ifbp-panel id="rentPlanBeforePanel" title="租金计划表（调息前）">
          <ifbp-template ref="rentPlanBefore_ref"
                        tplId="rentPlanBeforeTemplate"
                        :tplData="RentPlanBeforeData"
                        :tplResetFun="rentPlanBeforeResetFun"
                        funnode="YlSZB022"
                        nexuskey ="inoutplan"
                        :edit-button-show = "isEditShow"
                        @search-table-click="rentPlanBeforeSearchRow"
                        @form-cancel-click="rentPlanBeforeFormCancel"
                        show-type="table-form"
                        >
          </ifbp-template>
        </ifbp-panel>
        <ifbp-panel id="rentPlanAfterPanel" title="租金计划表（调息后）">
          <ifbp-template ref="rentPlanAfter_ref"
                        tplId="rentPlanAfterTemplate"
                        :tplData="RentPlanAfterData"
                        :tplResetFun="rentPlanAfterResetFun"
                        funnode="YlSZB022"
                        nexuskey ="inoutplan"
                        :edit-button-show = "isEditShow"
                        @search-table-click="rentPlanAfterSearchRow"
                        @form-cancel-click="rentPlanAfterFormCancel"
                        show-type="table-form"
                        >
          </ifbp-template>
        </ifbp-panel>
        <ifbp-panel title="附件管理">
            <ifbp-upload 
                busi-code="YlSZB022"
                :pk-busi="pk_adjust_interest"
                :disable-delete = 'isDelete'
                >
            </ifbp-upload>
        </ifbp-panel>
      </ifbp-panel-group>
      
        <!--删除确认Dialog-->
      <ifbp-del-dialog
        v-model="delAttDialogVisible"
        title="删除操作"
        message="确认删除该数据？删除后无法恢复。"
        @click="deleteAttClick"
        @cancel-click="deleteAttCancelClick"
        >
      </ifbp-del-dialog>

    </ifbp-main-area>
    <ifbp-footer>
        <el-button type="primary" class="fr" @click="clickReport" :disabled="reportClickDisable" style="margin-right:10px"> 报表</el-button>
    </ifbp-footer>
  </ifbp-page>
</template>
<script>
import {ylsBusi,pubDataUtils } from "../../../../common/js/publicData.js";
import initiateFlow from 'ifbp-busi-element/lib/initiateFlow.vue';
export default {
  components: {
    'initiateFlow':initiateFlow
  },
  mixins: [pubDataUtils()],
  data() {
    var oThis = this;
    return {
      reportClickDisable: false,
      delAttDialogVisible:false,
      isEditShow: false,
      //导入主表主键
      pk_adjust_interest:"",
      AdjustInterestBasicData:{},
      RentPlanData:{},
      editable:false,
      deletingIndex: null,
      delId:'',
      isDelete:false,
      RentPlanAfterData: {},
      RentPlanBeforeData:{},
      AttachManageData:{},
      rentPlanAfterResetFun($node){
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
      },
      rentPlanBeforeResetFun($node){
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
      },
    };
  },
  created() {
    this.loadData();
  },
  methods: {
        //租金计划表（调息前）查看
    rentPlanBeforeSearchRow(scope){  
      this.$refs.rentPlanBefore_ref.getTableComp().expandRow(scope.row);
      this.$refs.rentPlanBefore_ref.setFormData(scope.row);
      this.$refs.rentPlanBefore_ref.comp.editable = false;
    },
    //租金计划表（调息前）取消查看
    rentPlanBeforeFormCancel(){
      this.$refs.rentPlanBefore_ref.getTableComp().closeExpandRow();
    },
    //租金计划表（调息后）查看
    rentPlanAfterSearchRow(scope){
      this.$refs.rentPlanAfter_ref.getTableComp().expandRow(scope.row); 
      this.$refs.rentPlanAfter_ref.setFormData(scope.row); 
      this.$refs.rentPlanAfter_ref.comp.editable = false;
    },
    //租金计划表（调息后）取消查看
    rentPlanAfterFormCancel(){
      this.$refs.rentPlanAfter_ref.getTableComp().closeExpandRow();
    },
    //报表操作
    clickReport(){
    },
    //加载页面信息
    loadData(){
      this.pk_adjust_interest = this.$root.$router.currentRoute.params.id;
      //详情页面
      if(this.pk_adjust_interest && this.pk_adjust_interest != ""){
        
        this.loadBasicInfo(this.pk_adjust_interest);//加载调息信息
      }else{
        this.$message({
          message: "传入查询条件为空",
          type: "error"
        });
      }
    },
      //加载调息信息模块
    loadBasicInfo(pk_adjust_interest){
      this.$http({
          url: ylsBusi + "contr/adjust/interest/getById" ,
          headers: {'Content-Type': 'application/json'},  
          method: "post",
          data:pk_adjust_interest
      }).then(res => {
          if (res.data.success == true) {
            let originalValue = res.data.data;
            this.pubPackDataFun(originalValue);
            this.$refs.adjustInterestBasic_ref.setFormData(originalValue);
            let inoutplanlist = originalValue.inoutplanlist;
            let adjust_before = [];
            let adjust_after = [];
            for(let i = 0;i<inoutplanlist.length;i++){
                if(inoutplanlist[i].source_billtype === "ADJUST_INTEREST_BEFORE"){
                    adjust_before.push(inoutplanlist[i]);
                }else if(inoutplanlist[i].source_billtype === "ADJUST_INTEREST_AFTER"){
                    adjust_after.push(inoutplanlist[i]);
                }
            }
            this.$refs.rentPlanBefore_ref.setTableData(adjust_before);
            this.$refs.rentPlanAfter_ref.setTableData(adjust_after);
            //控制附件是否可删除
            if(originalValue.billstatus === '9' && originalValue.adjust_status === 'ADJUST_FINISH' ){
                this.isDelete = true;
            }
          }else{
            this.$message({
              message: res.data.error.errorMessage,
              type: "error"
            });
          }
      }).catch(e => {
        this.$message({
          message: "调息信息加载失败！",
          type: "error"
        });
      });
    },
  }
};
</script>
<style>
  .detail-button-header {
    height: 56px;
    padding: 10px 20px;
    background-color: #ffffff;
    border-bottom: 1px solid #e3e3e3;
  }
</style>
