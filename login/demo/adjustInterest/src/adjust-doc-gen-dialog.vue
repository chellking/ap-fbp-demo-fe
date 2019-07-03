<template>
<el-dialog :modal="true" width="30%" title="文档生成" v-model="cancelAllotDialogVisible" center>
    <div>
        <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
        <div style="margin: 15px 0;"></div>
        <el-checkbox-group v-model="checkedTpls" @change="handleCheckedTplChange">
            <el-checkbox class='yls_docDialog_checkbox' v-for="tpl in printTpls" :label="tpl" :key="tpl.templatecode" border>{{tpl.templatename}}</el-checkbox>
        </el-checkbox-group>
    </div>
    <span class="dialog-footer" slot="footer">
        <el-button @click="onDocPreview" type="primary">预览</el-button>
        <!-- <el-button @click="genDocPDFZip" type="primary">打包下载</el-button> -->
        <!-- <el-button @click="genDocPDF" type="primary">打开PDF文档</el-button>
        <el-button @click="genDocWord" type="primary">打开word文档</el-button>
        <el-button @click="genDocWordZip" type="primary">打包下载WORD文档</el-button> -->
        <el-button @click="cancelAllotDialogVisible = false">取 消</el-button>
    </span>
</el-dialog>
</template>
<script>
import { pagination, ylsBusi,pubDataUtils } from "../../../../common/js/publicData.js";
export default {
    data(){
        return {
            billid:null,
            cancelAllotDialogVisible:false,
            checkAll: false,
            isIndeterminate: false,
            printTpls:[],
            checkedTpls:[]
        };
    },
    props:{
        busicode:null
    },
    methods:{
        showGen(id){
            this.billid = id;
            this.requestPrintTpl();
            this.cancelAllotDialogVisible=true;
        },
        // 是否全选事件
        handleCheckAllChange(e) {
            this.checkedTpls = [];
            if(this.checkAll){
                for(var i = 0;i<this.printTpls.length;i++){
                    this.$set(this.checkedTpls,this.checkedTpls.length,this.printTpls[i]);
                }
            }
            this.isIndeterminate = false;
        },
        // 改变是否全选状态
        handleCheckedTplChange(value) {
            let checkedCount = value.length;
            this.checkAll = checkedCount === this.printTpls.length;
            this.isIndeterminate = checkedCount > 0 && checkedCount < this.printTpls.length;
        },
        // 获取打印模板
        requestPrintTpl(){
            var url = "/ifbp-print/rest/printCodeRelation/getRelationByCode";
            this.$http({
                url: url,
                method: "post",
                data: 'code='+this.busicode
            })
            .then(res => {
                this.printTpls = res.data.data;
            })
            .catch(e => {
                console.log(e);
                this.$message({
                    message: "信息打印模板错误",
                    type: "error"
                });
            });
        },
        // 生成文档
        genDocPDFZip(){
            debugger
            if(this.checkedTpls && this.checkedTpls.length > 0){
                var tplids = '';
                for(var i =0;i<this.checkedTpls.length;i++){
                    if(i>0){
                        tplids+=',';
                    }
                    tplids+=this.checkedTpls[i].pk_print_template;
                }
                window.open(ylsBusi+'base/doc/genPdfDoc?printtplids='+tplids+'&billid='+this.billid);
            }else{
                this.$message({
                    message: "请选择打印模板",
                    type: "error"
                });
            }
        },
        onDocPreview(){
            if(this.checkedTpls && this.checkedTpls.length > 0){
                if(this.checkedTpls.length==1){
                    var baseUrl =location.protocol + "//" + location.host;
                    window.open('/ifbp-print/static/html/iprint/businessPreview.html?serverUrl='+baseUrl+ylsBusi+'base/doc/replaceTemplateByPk?pk_print_template='+this.checkedTpls[0].pk_print_template+'&pk='+this.billid);
                }else{
                    this.$message({
                        message: "预览一次只能选择一个打印模板",
                        type: "error"
                    });
                }
            }else{
                this.$message({
                    message: "请选择打印模板",
                    type: "error"
                });
            }
        },
        onDocPreviewSelf(){
            debugger;
            if(this.checkedTpls && this.checkedTpls.length > 0){
                if(this.checkedTpls.length==1){
                    let data1 = {"pk_print_template":this.checkedTpls[0].pk_print_template,"pk":this.billid}; 
                    this.$http({
                    url: ylsBusi+'base/doc/onPreview',
                    headers: {'Content-Type': 'application/json'},
                    method: "post",
                    dataType: "json",
                    data: data1,
                })
                .catch(e => {
                    console.log(e);
                    this.$message({
                    message: "信息打印模板错误",
                    type: "error"
                });
            });
                }else{
                    this.$message({
                        message: "预览一次只能选择一个打印模板",
                        type: "error"
                    });
                }
            }else{
                this.$message({
                    message: "请选择打印模板",
                    type: "error"
                });
            }
        },
        genDocPDF(){
            if(this.checkedTpls && this.checkedTpls.length > 0){
                if(this.checkedTpls.length==1){
                    window.open('/print-demo/webapp/translate_to_pdf/translatepdf.html?pdfUrl=/ifbp-print/rest/printTemplate/htmltopdfByteStreamByGet?pk_print_template='+this.checkedTpls[0].pk_print_template+'&pk='+this.billid);
                }else{
                    this.$message({
                        message: "直接打开文档一次只能选择一个打印模板",
                        type: "error"
                    });
                }
            }else{
                this.$message({
                    message: "请选择打印模板",
                    type: "error"
                });
            }
        },
        // 生成文档
        genDocWordZip(){
            if(this.checkedTpls && this.checkedTpls.length > 0){
                var tplids = '';
                for(var i =0;i<this.checkedTpls.length;i++){
                    if(i>0){
                        tplids+=',';
                    }
                    tplids+=this.checkedTpls[i].pk_print_template;
                }
                window.open(ylsBusi+'base/doc/genWordDoc?printtplids='+tplids+'&billid='+this.billid);
            }else{
                this.$message({
                    message: "请选择打印模板",
                    type: "error"
                });
            }
        },
        genDocWord(){
            if(this.checkedTpls && this.checkedTpls.length > 0){
                if(this.checkedTpls.length==1){
                    window.open('/print-demo/webapp/translate_to_word/translateword.html?pk_print_template='+this.checkedTpls[0].pk_print_template+'&pk='+this.billid);
                }else{
                    this.$message({
                        message: "直接打开文档一次只能选择一个打印模板",
                        type: "error"
                    });
                }
            }else{
                this.$message({
                    message: "请选择打印模板",
                    type: "error"
                });
            }
        }
    }
}
</script>
<style>
  .yls_docDialog_checkbox {
    margin-right: 15px !important;
    margin-left: 0px !important;
    margin-top: 5px !important;
}
</style>

