import React from 'react'
import './InputSizeForm.css'

function InputsizeForm() {
  return (
    <form className='inputSizeForm'>
      <label htmlFor="inputSize">Input board size</label>
      <input placeholder='Ex: 3 or 5' min={3} type="number" id='inputSize'/>
      <div className='btnBottomForm'>
        <button style={{backgroundColor: 'red'}}>Single player</button>
        <button style={{backgroundColor: 'blue'}}>Multi player</button>
      </div>
    </form>
  )
}

export default InputsizeForm