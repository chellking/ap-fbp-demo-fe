<template>
  <ifbp-page>
    <ifbp-breadcrumb name="系统调息详情"></ifbp-breadcrumb>
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
        <ifbp-panel title="附件管理" :icons="materialIcons">
            <ifbp-upload 
                busi-code="YlSZB022"
                :pk-busi="pk_adjust_interest"
                :disable-delete = 'isDelete'
                :disable-upload = 'isDelete'
                >
            </ifbp-upload>
             <!-- 附件列表对话框 -->
          <el-dialog
              title='附件材料清单管理'
              v-model='materialVisible'
              @update:visible='val => materialVisible = val'
              @open='materialOpen'
              :modal='true'
              size='full'>
              <material-list ref='materialRef' :pk_busi="pk_adjust_interest" :isEdit="isedits">
              </material-list>
          </el-dialog>
        </ifbp-panel>
      </ifbp-panel-group>

      <ifbp-grandson-page ref = "realRateGrandsonRef" title = "实际利率表" :modal="true" style = "width:90%" @close = "realRateGrandsonClose" close-on-press-escape='true'>
            <ifbp-template ref="realRatePlanRef"
                          tplId="realRatePlanTemplate"
                          :funnode="realRateFunnode"
                          :nexuskey="realRateNexuskey_market"
                          :tplData="realRatePlanData"
                          show-type="table"
                        >
            </ifbp-template>
      </ifbp-grandson-page>
      <ifbp-grandson-page ref = "realRateGrandsonRef_highend" title = "实际利率表" :modal="true" style = "width:90%"  close-on-press-escape='true'>
            <ifbp-template ref="realRatePlanRef_highend"
                          tplId="realRatePlanTemplate_highend"
                          :funnode="realRateFunnode"
                          :nexuskey="realRateNexuskey_highend"
                          :tplData="realRatePlanData"
                          show-type="table"
                        >
            </ifbp-template>
      </ifbp-grandson-page>

    </ifbp-main-area>
    <ifbp-footer>
        <el-button type="primary" class="fr" @click="clickReport" :disabled="reportClickDisable" style="margin-right:10px">实际利率表</el-button>
    </ifbp-footer>
  </ifbp-page>
</template>
<script>
import {ylsBusi,pubDataUtils } from "../../../../common/js/publicData.js";
import materialList from '../../../../common/components/MaterialList.vue';
export default {
   components: {
    'material-list': materialList
  },
  mixins: [pubDataUtils()],
  data() {
    var oThis = this;
    return {
      isedits: true,
      materialVisible: false,
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
      realRateFunnode:'BT007',
      realRateNexuskey_market:'CALC008',
      realRateNexuskey_highend:'CALC009',
      realRatePlanData:{},
      RentPlanAfterData: {},
      RentPlanBeforeData:{},
      AttachManageData:{},
      //附件
       materialIcons: [
          {
            icon: 'search',
            click: function() {
              if(oThis.pk_operation_protocol===""){
                oThis.$message({
                  message: "请先保存基本信息",
                  type: "error"
                });
                return;
              }
              oThis.materialVisible = true;
            }
          }
        ],
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
      debugger;
      let busi_type = this.$refs.adjustInterestBasic_ref.getFormData().pk_quote_calculator_ref$busi_type;
        let ifHighend = false;
        if(busi_type && busi_type === 'HIGHENDBUSI'){
            ifHighend = true;
        }
        if(ifHighend){
          this.$refs.realRateGrandsonRef_highend.showPage();
        }else{
          this.$refs.realRateGrandsonRef.showPage();
        }
        this.$http({
          url: ylsBusi+'contr/adjust/interest/getRealRatesByPk',
          headers: { 'Content-Type': 'application/json' },
          method: 'post',
          dataType: 'json',
          data: this.pk_adjust_interest,
        }).then(res => {
          if (res.data.success === true) {
              var originalValue = res.data.data;
              if(ifHighend){
                this.$refs['realRatePlanRef_highend'].setTableData(originalValue);
              }else{
                this.$refs['realRatePlanRef'].setTableData(originalValue);
              }
              
          } else {
            this.$message({
              message: res.data.error.errorMessage,
              type: 'error',
            });
          }
        }).catch(e => {
          this.$message({
            message: '查询错误！',
            type: 'error',
          });
        });
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
            if('204'==originalValue.bill_status || '9' ==originalValue.bill_status){
              this.isedits=false;
            }
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
     // 附件列表信息加载
    materialOpen(){
        setTimeout(() => {
            this.$refs.materialRef.request();
        },0)
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
