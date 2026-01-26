import Location from './location.model.js';

class LocationService {
    async getAllLocations() {
        return await Location.findAll({
            order: [['city_name', 'ASC']]
        });
    }

    async getActiveLocations() {
        return await Location.findAll({
            where: { is_active: true },
            order: [['city_name', 'ASC']]
        });
    }

    async createLocation(data) {
        if (data.city_name) data.city_name = data.city_name.trim();
        if (data.state) data.state = data.state.trim();
        return await Location.create(data);
    }

    async updateLocation(id, data) {
        if (data.city_name) data.city_name = data.city_name.trim();
        if (data.state) data.state = data.state.trim();
        const location = await Location.findByPk(id);
        if (!location) {
            const error = new Error('Location not found');
            error.statusCode = 404;
            throw error;
        }
        return await location.update(data);
    }

    async deleteLocation(id) {
        const location = await Location.findByPk(id);
        if (!location) {
            const error = new Error('Location not found');
            error.statusCode = 404;
            throw error;
        }
        return await location.destroy();
    }
}

export default new LocationService();
