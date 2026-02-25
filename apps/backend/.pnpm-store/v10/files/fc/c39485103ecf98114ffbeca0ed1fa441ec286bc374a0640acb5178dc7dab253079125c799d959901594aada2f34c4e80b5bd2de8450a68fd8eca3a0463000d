import mongoose from 'mongoose';
import { getBuildQueryPlugin } from '../queries/getBuildQueryPlugin.js';
import { buildSchema } from './buildSchema.js';
export const buildGlobalModel = (payload)=>{
    if (payload.config.globals && payload.config.globals.length > 0) {
        const globalsSchema = new mongoose.Schema({}, {
            discriminatorKey: 'globalType',
            minimize: false,
            timestamps: true
        });
        globalsSchema.plugin(getBuildQueryPlugin());
        const Globals = mongoose.model('globals', globalsSchema, 'globals');
        Object.values(payload.config.globals).forEach((globalConfig)=>{
            const globalSchema = buildSchema({
                buildSchemaOptions: {
                    options: {
                        minimize: false
                    }
                },
                configFields: globalConfig.fields,
                payload
            });
            Globals.discriminator(globalConfig.slug, globalSchema);
        });
        return Globals;
    }
    return null;
};

//# sourceMappingURL=buildGlobalModel.js.map