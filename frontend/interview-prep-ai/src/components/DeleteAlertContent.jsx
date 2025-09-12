import React from 'react'

const DeleteAlertContent = ({content, OnDelete}) => {
  return (
    <div className='p-5'>
      <p className='text-[14px]'>{content}</p>

      <div className='flex justify-end mt-6'>
        <button
            type="button"
            className='btn-small'
            onClick={OnDelete}
        >
            Delete
        </button>
      </div>
    </div>
  )
}

export default DeleteAlertContent
