<template>
  <div class="tab-container">
    <sticky :z-index="10" :class-name="'sub-navbar'">
      <el-button v-loading="loading" style="margin-left: 10px;" type="success" @click="saveFooter()">
        Save
      </el-button>
    </sticky>
    <el-button class="filter-item" style="margin-left: 10px;margin-top: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
      Add Column
    </el-button>
    <el-tabs v-model="activeName" style="margin-top:15px;" type="border-card">
      <el-tab-pane v-for="(item,index) in tabMapOptions" :key="item.key" :label="item.label" :name="item.key">
        <el-form ref="dataForm1" :model="item" label-position="left" label-width="120px" style="width: 500px;">
          <el-form-item label="Column Name" prop="column_name">
            <el-input v-model="item.label" />
          </el-form-item>
          <el-form-item label="Actions" align="left" width="50" class-name="small-padding fixed-width">
            <el-button size="mini" :type="item.active ? 'danger' : 'success'" @click="item.active = !item.active">
              {{item.active ? 'InActive' : 'Active'}}
            </el-button>
            <el-button size="mini" type="danger" @click="confirmDelete(index)">
              Delete
            </el-button>
          </el-form-item>
        </el-form>
        <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="createLine(item)">
          Add Line
        </el-button>
        <keep-alive>
          <tab-pane v-if="activeName==item.key" :type="item.key" :item="item.value" />
        </keep-alive>
      </el-tab-pane>
    </el-tabs>
    <el-dialog title="Name Of Column" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :model="tab" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="Title" prop="title">
          <el-input v-model="tab.label" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelChange()">
          Cancel
        </el-button>
        <el-button type="primary" @click="changeNameColumn()">
          Confirm
        </el-button>
      </div>
    </el-dialog>
    <el-dialog title="Are you sure delete this column ?" :visible.sync="dialogDeleteColumn">
      <!--<div slot="footer" class="dialog-footer">-->
        <el-button @click="dialogDeleteColumn = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="deleteColumn()">
          Confirm
        </el-button>
      <!--</div>-->
    </el-dialog>
  </div>
</template>

<script>
  import { fetchFooter,UpdateFooter } from '@/api/footer'
  import tabPane from './components/TabPane'
  import Sticky from '@/components/Sticky'
  export default {
    name: 'Tab',
    components: { tabPane , Sticky },
    data() {
      return {
        loading: false,
        // tabMapOptions: [
        //   { label: 'China', key: 'CN' },
        //   { label: 'USA', key: 'US' },
        //   { label: 'Japan', key: 'JP' },
        //   { label: 'Eurozone', key: 'EU' }
        // ],
        tabMapOptions : [],
        activeName: '',
        createdTimes: 0,
        dialogFormVisible : false,
        dialogDeleteColumn : false,
        indexDeleteColumn : 0,
        tab : {}
      }
    },
    watch: {
      activeName(val) {
        this.$router.push(`${this.$route.path}?tab=${val}`)
      }
    },
    created() {
      // init the default selected tab
      this.getFooter()
      // const tab = this.$route.query.tab
      // if (tab) {
      //   this.activeName = tab
      // }
    },
    methods: {
      getFooter(){
        let params = {id : 1}
        var vm = this
        fetchFooter(params).then(response => {
          this.tabMapOptions = JSON.parse(response.data.data)
          if(this.tabMapOptions.length > 0){
            this.activeName = this.tabMapOptions[0].key
          }
        }).catch(err => {
          console.log(err)
        })
      },
      createLine(item){
        let line = {title : '',link : ''}
        if(item.value && item.value.length > 0){
          item.value.push(line)
        }else{
          item.value = []
          item.value.push(line)
        }
        this.$forceUpdate()
      },
      showCreatedTimes() {
        this.createdTimes = this.createdTimes + 1
      },
      handleCreate(){
        let index = 'key-' + (this.tabMapOptions.length + 1)
        let newTab = {label: '', key : index , value : [] ,active : true}
        this.tab = newTab
        this.dialogFormVisible = true
      },
      changeNameColumn() {
        this.tabMapOptions.push(this.tab)
        this.activeName = this.tab.key
        this.dialogFormVisible = false
      },
      cancelChange() {
        this.dialogFormVisible = false
        this.tab = {}
      },
      deleteColumn(){
        this.tabMapOptions.splice(this.indexDeleteColumn,1)
        this.dialogDeleteColumn = false
      },
      confirmDelete(index){
        this.dialogDeleteColumn = true
        this.indexDeleteColumn = index
      },
      saveFooter(){
        let data = {
          id : 1,
          data : JSON.stringify(this.tabMapOptions)
        }
        UpdateFooter(data).then(response => {
          this.$notify({
            title: 'Success',
            message: 'Edit Successfully!',
            type: 'success',
            duration: 2000
          })
        }).catch(err => {
        })
      }
    }
  }
</script>

<style scoped>
  .tab-container {
    margin: 30px;
  }
</style>
