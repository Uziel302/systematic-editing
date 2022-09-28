import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { EditorComponent } from './editor/editor.component';
import { LoginSuccessComponent } from './login-success/login-success.component';

const routes: Routes = [
  { path: '', component: EditorComponent, pathMatch: 'full' },
  { path: 'success/:name', component: LoginSuccessComponent },
  { path: 'about', component: AboutComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
