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

    updateUserProfile(data: Partial<{ firstName: string; lastName: string; phone: string; gender: string }>) {
        return this.http.patch(`${this.userUtl}/update`, data);
    }

    uploadProfilePic(file: File) {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.patch(`${this.userUtl}/changePFP`, formData);
    }
}