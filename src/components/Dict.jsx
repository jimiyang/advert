import {
  getDictByType
} from '@/api/api';
class Dict {
  /*constructor(name) {
    this.name = name
  }*/
  loadData (type, selData) {
    let arr = []
    return getDictByType({type}).then(rs => {
      selData.map(item => {
        rs.data.map(node => {
          if (item === node.value) {
            arr.push(node.label);
          }
        });
      });
      return arr
    });
  }
  childLoadData (type, selData) {
    let arr = []
    return getDictByType({type}).then(rs => {
      selData.map(item => {
        rs.data.map(node => {
          node.dictChildList.map(child => {
            if (child.value === item) {
              arr.push(child.label)
            }
          })
        })
      })
      return arr
    })
  }
}
export default Dict;