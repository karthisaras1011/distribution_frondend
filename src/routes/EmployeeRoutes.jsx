import { Routes, Route } from 'react-router-dom';
import EmployeeLayout from '../layouts/EmployeeLayout';
import * as EmployeePages from '../pages/employee';



function EmployeeRoutes() {
  return (
    
      <Routes>
       <Route path="/" element={<EmployeeLayout />}>
       <Route path="inn" element={<EmployeePages.InwardCover />}/>
       <Route path="return" element={<EmployeePages.Returns />}/>
       <Route path="byapp" element = {<EmployeePages.ReturnsByApp/>}/>
       <Route  path="box"element={<EmployeePages.BoxUpdate />}/>
       <Route  path="sales"element={<EmployeePages.Sales />}/>
       <Route  path="check"element={<EmployeePages.ChequeEntry />}/>
       <Route  path="ward"element={<EmployeePages.Inward />}/>
       <Route  path="rever"element={<EmployeePages.Returnss />}/>
       <Route  path="lr"element={<EmployeePages.LrUpdate />}/>
       <Route  path="ebs"element={<EmployeePages.Ebs />}/>
       <Route  path="sale"element={<EmployeePages.Salable />}/>
       <Route  path="delever"element={<EmployeePages.DeliverApp />}/>
       <Route  path="mising"element={<EmployeePages.MisingInvoices />}/>
       <Route  path="img"element={<EmployeePages.DeleteChequeImages />}/>
       <Route  path="voice"element={<EmployeePages.DeleteInvoiceImages />}/>
       <Route path="pes" element={<EmployeePages.EbsUpdate />} />
       <Route path="salable" element={<EmployeePages.salableUbdate />} />

      </Route>
      </Routes>
    
  );
}

export default EmployeeRoutes;