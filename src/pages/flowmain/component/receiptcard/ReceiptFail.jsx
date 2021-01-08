import React,{Component} from 'react'
import { Modal} from 'antd'

class ReceiptFail extends Component{
    error() {
        Modal.error({
          title: 'This is an error message',
          content: 'some messages...some messages...',
        });
      }

    render(){
        return <div>
            1111234564646
        </div>
    }
}

export default ReceiptFail