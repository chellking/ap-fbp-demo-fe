<template>
  <ifbp-page>
    <el-breadcrumb separator="/">
    <el-breadcrumb-item :to="{ path: '/adjustInterest/adjustInterest_hand_list' }">手工调息</el-breadcrumb-item>
    <el-breadcrumb-item>手工调息详情</el-breadcrumb-item>
    </el-breadcrumb>
    <ifbp-main-area type="detail">
    <ifbp-panel-group :navbar="true"> 
      <ifbp-panel id="AdjustInterestBasicPanel" title="调息信息" :icons="baseIcons">
          <ifbp-template ref="adjustInterestBasic_ref"
                        tplId="adjustInterestBasicTemplate"
                        :tplData="AdjustInterestBasicData"
                        funnode="YlSZB022"
                        nexuskey ="adjustInterest_basicInfo"
                        :tplResetFun= "adjustInterestBasicRestFun"
                        :methods = "base_methods"
                        :editable="editable"
                        show-type="form" 
                        >
          </ifbp-template>
          <div class="form-button-div" v-if="editable">
            <el-button type="default" class="button-no-radius" @click="clickCancelBasicInfo">取消</el-button>
            <el-button type="primary" class="button-no-radius" @click="clickSaveBasicInfo">保存</el-button>
          </div>
        </ifbp-panel>

        
      <ifbp-panel id="rentPlanBeforePanel" title="租金计划表（调息前）">
          <ifbp-template ref="rentPlanBefore_ref"
                        tplId="rentPlanBeforeTemplate"
                        :tplData="RentPlanBeforeData"
                        funnode="YlSZB022"
                        nexuskey ="inoutplan"
                        :edit-button-show = "isEditShow"
                        :tplResetFun="rentPlanBeforeResetFun"
                        @search-table-click="rentPlanBeforeSearchRow"
                        @form-cancel-click="rentPlanBeforeFormCancel"
                        show-type="table-form" 
                        >
          </ifbp-template>
        </ifbp-panel>
        <ifbp-panel id="rentPlanAfterPanel" title="租金计划表（调息后）" :icons="plusRentPlanIcons">
          <ifbp-template ref="rentPlanAfter_ref"
                        tplId="rentPlanAfterTemplate"
                        :tplData="RentPlanAfterData"
                        :tplResetFun="rentPlanAfterResetFun"
                        funnode="YlSZB022"
                        nexuskey ="inoutplan"
                        :edit-button-show = "isEditShow"
                        @search-table-click="rentPlanAfterSearchRow"
                        @edit-table-click="rentPlanAfterEditRow"
                        @form-confirm-click="rentPlanAfterFormConfirm"
                        @form-cancel-click="rentPlanAfterFormCancel"
                        @form-edit-click="rentPlanAfterFormEdit"
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

    </ifbp-main-area>
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
    <ifbp-grandson-page ref = "rentGrandsonRef" title = "导入数据" :modal=true style = "width:60%" close-on-press-escape=true>
      <div id="example-container" class="wrapper">
        <div class="list-main-container clearfix">
          <div id="hot-preview">
            <hot-table :root="root" ref="rentRefOfHandsontable" :settings="hotSettings"></hot-table>
          </div>
        </div>
      </div>
      <div class="form-button-div">
        <el-button type="default" class="button-no-radius" @click="rentFormCancel">取消</el-button>
        <el-button type="primary" class="button-no-radius" @click="rentFormConfirm">保存</el-button>
      </div>
    </ifbp-grandson-page>
    <ifbp-footer>
        <el-button type="primary" class="fr" @click="clickReport" :disabled="reportClickDisable" style="margin-right:10px">实际利率表</el-button>
    </ifbp-footer>
  </ifbp-page>
</template>
<script>
import { pagination, ylsBusi,pubDataUtils } from "../../../../common/js/publicData.js";
import HotTable from '../../../../common/components/handsontable1/HotTable.vue';
import handsontablePub  from '../../../../common/js/handsontablePub.js';
import materialList from '../../../../common/components/MaterialList.vue';
export default {
  mixins: [handsontablePub, pubDataUtils()],
  components: {
        'hot-table':HotTable,
        'material-list': materialList
    },
  data() {
    var oThis = this;
    return {
      isedits: true,
      materialVisible: false,
      reportClickDisable: false,
      //导入主表主键
      pk_adjust_interest:"",
      copyForBasicInfo:'',
      AdjustInterestBasicData:{ },
      realRateFunnode:'BT007',
      realRateNexuskey_market:'CALC008',
      realRateNexuskey_highend:'CALC009',
      realRatePlanData:{},
      RentPlanData:{},
      editable:false,
      isEditShow: true,
      isDelete:false,
      RentPlanAfterData: {},
      RentPlanBeforeData:{},
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
      // 渲染表格
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
      rentPlanAfterResetFun($node) {
          let $table = $node.find("el-table");
          let operateArr = [
              {
                icon: "search",
                 title: "查看"
              },
              {
                icon: "edit",
                title: "编辑"
              }
          ];
          var operateHtml = this.getTableOperateHtml(operateArr);
          $table.append(operateHtml);
          return $node[0].outerHTML;
      },
      adjustInterestBasicRestFun($node){
          var $floatMethod = $node.find("[v-model='adjustInterest_basic.float_method']"); 
          $floatMethod.attr('v-on:change', 'floatMethodChangeFun');

          var $floatValue = $node.find("[v-model='adjustInterest_basic.float_value']"); 
          $floatValue.attr('v-on:change', 'floatValueChangeFun');

          var $finalRateAfter = $node.find("[v-model='adjustInterest_basic.final_rate_after']"); 
          $finalRateAfter.attr('v-on:change', 'finalRateAfterChangeFun');

      },
      base_methods:{
          floatMethodChangeFun(type,data){
              let basicdata = oThis.$refs.adjustInterestBasic_ref.getFormData();
              let float_method = type;
              if( float_method == 'RAISE' ){
                  basicdata.final_rate_after = basicdata.interrate_after + basicdata.float_value;
              }else if( float_method == "FLOATING" ){
                  basicdata.final_rate_after = basicdata.interrate_after * ( 1 + basicdata.float_value );
              }
              basicdata.pra_scope = basicdata.final_rate_after - basicdata.final_rate_before;
              oThis.$refs.adjustInterestBasic_ref.setFormData(basicdata);
          },
          floatValueChangeFun(type,data){
              let basicdata = oThis.$refs.adjustInterestBasic_ref.getFormData();
              let float_method = basicdata.float_method;
              let float_value = parseFloat(type);
              if(float_value !== null && float_value !=="" && float_method == "RAISE"){
                  basicdata.final_rate_after = basicdata.interrate_after + float_value;
              }else if( float_value !== null && float_value !=="" && float_method == "FLOATING" ){
                  basicdata.final_rate_after = basicdata.interrate_after * ( 1 + float_value );
              }
              basicdata.pra_scope = basicdata.final_rate_after - basicdata.final_rate_before;
              oThis.$refs.adjustInterestBasic_ref.setFormData(basicdata);
          },
          finalRateAfterChangeFun(type,data){
              let basicdata = oThis.$refs.adjustInterestBasic_ref.getFormData();
              let float_method = basicdata.float_method;
              let final_rate_after = type;
              if(final_rate_after !== null && final_rate_after !=="" && float_method == "RAISE"){
                  basicdata.float_value = final_rate_after - basicdata.interrate_after ;
              }else if( float_method == "FLOATING" ){
                  basicdata.float_value = final_rate_after / basicdata.interrate_after - 1 ;
              }
              basicdata.pra_scope = final_rate_after - basicdata.final_rate_before;
              oThis.$refs.adjustInterestBasic_ref.setFormData(basicdata);
          }
      },

      baseIcons: [
        {
          icon: "edit",
          click: function() {
            oThis.editable = !oThis.editable;
          },
          show:true,
        }
      ],
      plusRentPlanIcons:[
        {
          icon:"edit",
          title:"导入数据",
          click: function() {
            oThis.setRentGrandsonStatus(true,false);
          },
          show:true,
        }
      ],
    };
  },
  created() {
    this.loadData();
  },
  methods: {
      //编辑取消---基本信息
      clickCancelBasicInfo(){
        this.editable = false;
        this.$refs.adjustInterestBasic_ref.setFormData(JSON.parse(JSON.stringify(this.baseData)));
      },
      //保存操作---基本信息
      clickSaveBasicInfo(){
        var data=this.$refs.adjustInterestBasic_ref.getFormData();
        var jsonData = JSON.parse(JSON.stringify(data));
        let url ='';
        if(data.pk_adjust_interest){
            url=ylsBusi + 'contr/adjust/interest/update';//后台方法
        }
        this.clearPackDataFun(jsonData);
        this.$http({
            url: url,
            method: "post",
            data:jsonData
        }).then(res => {
            if (res.data.success == true) {
              this.editable = false;
              var originalValue = res.data.data;
              this.pubPackDataFun(originalValue);
              this.$refs.adjustInterestBasic_ref.setFormData(originalValue);
              this.$message({ message: '保存成功!',type: 'success'});
              //备份
              this.baseData = JSON.parse(JSON.stringify(originalValue));
              }else{
              this.$message({message: res.data.error.errorMessage,type: "error"});
              }
        }).catch(e => {
          this.$message({
            message: "基本信息保存失败！",
            type: "error"
          });
        });
      },
      //租金计划表（调息前）查看
      rentPlanBeforeSearchRow(scope){  
        this.isEditShow = false;
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
        this.rentPlanData = JSON.parse(JSON.stringify(scope.row));
        this.baseEditIndex = scope.$index;
      },
      //租金计划表（调息后）编辑
      rentPlanAfterEditRow(scope){
        var data=this.$refs.adjustInterestBasic_ref.getFormData();
          if(this.billstatus !== '20'&& this.billstatus !=='36'){
            this.$message({
              message: "该数据已提交，不允许进行修改！",
              type: "error"
            });
            return;
          }
          // 备份数据
          this.rentPlanData = JSON.parse(JSON.stringify(scope.row));
          this.baseEditIndex = scope.$index;
          this.$refs.rentPlanAfter_ref.getTableComp().expandRow(scope.row);
          this.$refs.rentPlanAfter_ref.comp.editable = true;
          this.isEditShow = true;
          this.$refs.rentPlanAfter_ref.setData('AdjustInoutPlan',scope.row); 
          
      },
      //租金计划表（调息后）保存
      rentPlanAfterFormConfirm(type){
        if( this.pk_adjust_interest != null ){
          let data = this.$refs.rentPlanAfter_ref.getFormData();
          data.pk_adjust_interest = this.pk_adjust_interest;
          let url = ylsBusi + 'contr/adjust/inoutPlan/save';
          let jsonData = JSON.parse(JSON.stringify(data));
          let cash = data.cash == null ? 0 :data.cash;
          let corpus = data.corpus == null ? 0 : data.corpus;
          let interest = data.interest == null ? 0 : data.interest;
          if(cash !=  corpus + interest){
              this.$message({
                message: "存在租金不等于本金与利息和的数据，不可进行保存操作！",
                type: "error"
              });  
          }else if(cash < 0 || corpus < 0 || interest < 0){
              this.$message({
                message: "存在小于0的数值，不可进行保存操作！",
                type: "error"
              });  
          }else{
              this.clearPackDataFun(jsonData);
              this.$http({
                  url: url,
                  method: "post",
                  data:jsonData
              }).then(res => {
                  if (res.data.success === true) {
                      this.$message({
                        message: "保存成功！",
                        type: "success"
                      });
                      this.$refs.rentPlanAfter_ref.getTableComp().closeExpandRow();
                      this.loadData();
                      this.rentPlanData = null;
                      this.baseEditIndex = null;
                  } else {
                      this.$message({
                        message: res.data.error.errorMessage,
                        type: "error"
                      });
                  }
              }).catch(e => {
                  this.$message({
                    message: "租金计划数据保存失败！",
                    type: "error"
                  });
              });
          }
        }else{
          this.$message({
            message: "调息信息不完整！",
            type: "error"
          });
        }
      },
      //租金计划表（调息后）取消新增、编辑、查看
      rentPlanAfterFormCancel(type){
          if (type === "form") {
              this.$refs.rentPlanAfter_ref.comp.formShow = false;
          } else {
              this.RentPlanAfterData.AdjustInoutPlan_t.splice(this.baseEditIndex,1,this.rentPlanData);
              this.$refs.rentPlanAfter_ref.getTableComp().closeExpandRow();
          }
          this.rentPlanData = null;
          this.baseEditIndex = null;
      },
      //form编辑
      rentPlanAfterFormEdit(){
          this.$refs.rentPlanAfter_ref.comp.editable = true;
      },

      //导入数据---start
      setRentGrandsonStatus(show,edit){
          this.handsontableReadOnly=edit;
          if(show){
              let inoutData = this.$refs.rentPlanAfter_ref.getTableData();
              let eleArray = [];
              if(inoutData){
                  inoutData.forEach((item, index) => {
                      if(item.pk_inouttype === 'OID10000000pai12'){   //
                          eleArray.push(item);
                      }
                  });
              }
              this.hotSettings.data = null;
              this.hotSettings.data = JSON.parse(JSON.stringify(eleArray));
              this.$refs.rentGrandsonRef.showPage();
              this.hotSettings.columns[0].readOnly = false;
              this.hotSettings.columns[1].readOnly = false;
              this.hotSettings.columns[2].readOnly = false;
              this.hotSettings.columns[3].readOnly = false;
          }else{
              this.$refs.rentGrandsonRef.hidePage();
          }
          let handsontable = this.$refs["rentRefOfHandsontable"].table;
          if(!edit && handsontable.countRows() <= 0){
              handsontable.alter('insert_row',handsontable.countRows());
          }
          this.hotSettings.contextMenu.items['row_above'].disabled=edit;
          this.hotSettings.contextMenu.items['row_below'].disabled=edit;
          this.hotSettings.contextMenu.items['remove_row1'].disabled=edit;
          this.hotSettings.contextMenu.items['add_row'].disabled=edit;
      },
      rentFormCancel(){
          this.setRentGrandsonStatus(false,true);
      },
      rentFormConfirm(){
          let hThis = this;
          let handsontable = this.$refs["rentRefOfHandsontable"].table.validateCells(function(valid){
              if(valid){
                    let jsonData = hThis.$refs.adjustInterestBasic_ref.getFormData();
                    hThis.clearPackDataFun(jsonData);
                    jsonData.inoutplanlist = hThis.hotSettings.data;
                    let inoutplanlist = jsonData.inoutplanlist;
                    for(let i = 0 ; i < inoutplanlist.length ; i++){
                        let cash = inoutplanlist[i].cash == null ? 0 :inoutplanlist[i].cash;
                        let corpus = inoutplanlist[i].corpus == null ? 0 : inoutplanlist[i].corpus;
                        let interest = inoutplanlist[i].interest == null ? 0 : inoutplanlist[i].interest;
                        // 保留两位小数，防止精度问题
                        if((cash - corpus - interest ).toFixed(2) != 0 ){
                            hThis.$message({message: "存在租金不等于本金与利息和的数据，不可进行保存操作！",type: "error"});  
                            return;
                        }
                    }
                    hThis.$http({
                        url: ylsBusi + "contr/adjust/interest/saveImport",
                        headers: {'Content-Type': 'application/json'},
                        method: "post",
                        data: jsonData,
                    }).then(res => {
                        if (res.data.success == true) {
                            hThis.loadData();
                            hThis.setRentGrandsonStatus(false,true);
                            hThis.$message({message: "保存成功！", type: "success"});
                        }else{
                            hThis.$message({message: res.data.error.errorMessage, type: "error"});
                        }
                    }).catch(e => {
                        hThis.$message({message: "保存租金计划失败！",type: "error"});
                    });
                  
              }else{
                  hThis.$message({message: "请输入正确的数据格式！",type: "error"});
              }
          });
      },
      //导入数据---end
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
      
      loadData(){
        this.pk_adjust_interest = this.$root.$router.currentRoute.params.id;
        //详情页面
        if(this.pk_adjust_interest && this.pk_adjust_interest != ""){
          this.billstatus = this.$root.$router.currentRoute.params.billstatus;
          if(this.billstatus !== '20'&& this.billstatus !=='36'){
            this.baseIcons[0].show = false;
            this.plusRentPlanIcons[0].show = false;
            this.isEditShow = false;
          }
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
              if('204'==originalValue.bill_status || '9' ==originalValue.bill_status){
                this.isedits=false;
              }
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
              //备份
              this.baseData = JSON.parse(JSON.stringify(originalValue));
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
