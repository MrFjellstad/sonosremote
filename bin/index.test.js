const { describe, it, expect, jest, beforeEach } = require('@jest/globals');

describe('deviceDescription', () => {
    let deviceDescription;
    let mockDevice;

    beforeEach(() => {
        mockDevice = {
            deviceDescription: jest.fn(),
        };

        deviceDescription = (device) => {
            return new Promise((resolve, reject) => {
                device.deviceDescription((err, info) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(info);
                    }
                });
            });
        };
    });

    it('should resolve with device info on success', async () => {
        const deviceInfo = { roomName: 'Living Room', uuid: '123' };
        mockDevice.deviceDescription.mockImplementation((callback) => {
            callback(null, deviceInfo);
        });

        const result = await deviceDescription(mockDevice);
        expect(result).toEqual(deviceInfo);
    });

    it('should reject with error on failure', async () => {
        const error = new Error('Device not found');
        mockDevice.deviceDescription.mockImplementation((callback) => {
            callback(error);
        });

        await expect(deviceDescription(mockDevice)).rejects.toThrow('Device not found');
    });

    it('should call device.deviceDescription callback', async () => {
        mockDevice.deviceDescription.mockImplementation((callback) => {
            callback(null, {});
        });

        await deviceDescription(mockDevice);
        expect(mockDevice.deviceDescription).toHaveBeenCalledTimes(1);
    });
});