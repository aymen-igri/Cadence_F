import { inject, Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";

@Injectable({ providedIn: 'root' })
export class SettingsService {
    private readonly userUtl = `${environment.apiUrl}/users`;
    private http = inject(HttpClient);

    getUserProfile(){
        const responce = this.http.get(`${this.userUtl}/profile`);
        console.log(responce);
        return responce;
    }
}