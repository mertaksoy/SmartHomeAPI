import * as tradfriClient from 'node-tradfri-client';
import {DiscoveredGateway, TradfriClient, Accessory, GroupInfo} from 'node-tradfri-client';
import {Group} from "node-tradfri-client";

export class Client {
    private securityCode = '';
    private _tradfriGateway = {} as DiscoveredGateway;
    private _tradfri = {} as TradfriClient;

    async connect() {
        this._tradfriGateway = await tradfriClient.discoverGateway() as DiscoveredGateway;
        if (this._tradfriGateway && !!this._tradfriGateway.host) {
            this._tradfri = new TradfriClient(this._tradfriGateway.host);
            const authToken = await this._tradfri.authenticate(this.securityCode);

            this._tradfri.connect(authToken.identity, authToken.psk);
            this._tradfri.observeGroupsAndScenes();
            this._tradfri.on('device updated', this.deviceUpdated).observeDevices();

            console.log('Authenticated and connected successfully');
            return true;
        }
        return false;
    }

    async operateGroup(group: Group, onOff: boolean) {
        return this._tradfri.operateGroup(group, {onOff: onOff}, true);
    }

    get devices(): Record<string, Accessory> {
        return this._tradfri.devices;
    }

    get groups(): Record<string, GroupInfo> {
        return this._tradfri.groups;
    }

    get tradfriGateway(): DiscoveredGateway | undefined {
        return this._tradfriGateway;
    }

    /**
     * Workaround for the issue https://github.com/AlCalzone/node-tradfri-client/issues/390
     * Updating group onOff status when device status change
     * @param device
     */
    private deviceUpdated(device: Accessory) {
        Object.keys(this._tradfri.groups).forEach((key: string) => {
            const deviceInGroup = this._tradfri.groups[key].group.deviceIDs.find((deviceId: number) => deviceId === device.instanceId);
            if (deviceInGroup && device.type === tradfriClient.AccessoryTypes.lightbulb) {
                this._tradfri.groups[key].group.onOff = device.lightList[0].onOff;
            }
        })
    }
}
