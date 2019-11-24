<template>
  <el-table :data="item" border fit highlight-current-row style="width: 100%">
    <el-table-column min-width="300px" label="Title">
      <template slot-scope="{row}">
        <el-input v-model="row.title" />
      </template>
    </el-table-column>

    <el-table-column min-width="300px" label="Link">
      <template slot-scope="{row}">
        <el-input v-model="row.link" />
      </template>
    </el-table-column>
    <el-table-column min-width="300px" label="Action">
      <template slot-scope="scope">
        <el-button size="mini" type="danger" @click="deleteRow(scope.$index)">
          Delete
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { fetchList } from '@/api/article'

export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  props: {
    type: {
      type: String,
      default: 'CN'
    },
    item: {
      type : Array,
      default: function () { return [] }
    }
  },
  data() {
    return {
      list: null,
      listQuery: {
        page: 1,
        limit: 5,
        type: this.type,
        sort: '+id'
      },
      loading: false
    }
  },
  created() {
    // console.log('sdsdsd',this.item)
    // this.getList()
  },
  methods: {
    deleteRow(index){
      this.item.splice(index,1)
    }
  }
}
</script>

