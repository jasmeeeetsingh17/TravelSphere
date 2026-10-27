import React from 'react'
import { Outlet } from 'react-router'

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      MobileSideBar
      <aside className='w-full max-w-67.5 hidden lg:block'> SideBar

      </aside>
      <aside className='children'> <Outlet /></aside>
    </div>
  )
}
export default AdminLayout
