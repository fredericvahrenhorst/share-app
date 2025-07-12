import mongoose from 'mongoose';
export const destroy = async function destroy() {
    await mongoose.disconnect();
    Object.keys(mongoose.models).map((model)=>mongoose.deleteModel(model));
};

//# sourceMappingURL=destroy.js.map