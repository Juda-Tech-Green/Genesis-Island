import Phaser from "phaser";
import MatterEntity from "./MatterEntity";

export default class Resource extends MatterEntity {
    static preload(scene) {
        scene.load.atlas("resources", 'assets/images/resources.png', 'assets/images/resources_atlas.json')
        scene.load.audio('tree', 'assets/audio/tree.mp3');
        scene.load.audio('rock', 'assets/audio/rock.mp3');
        scene.load.audio('bush', 'assets/audio/bush.mp3');
        scene.load.audio('pickup', 'assets/audio/pickup.mp3')
    }

    constructor(data) {
        const { scene, resource } = data;

        // leer propiedades de forma segura
        const props = Array.isArray(resource.properties) ? resource.properties : [];
        let tipo = props.find(p => p.name === 'tipo')?.value;
        let yOrigin = props.find(p => p.name === 'yOrigin')?.value;


        // fallback: si no están en el objeto, intentar leer del tileset (si hay gid)
        if ((tipo === undefined || yOrigin === undefined) && resource.gid && scene.map) {
            const tileset = scene.map.tilesets[0];
            const tileId = resource.gid - tileset.firstgid;
            const tileProps = tileset.tileProperties?.[tileId] ?? {};
            tipo = tipo ?? tileProps.tipo;
            yOrigin = yOrigin ?? tileProps.yOrigin;
        }

        if (!tipo) tipo = 'unknown';
        if (yOrigin === undefined) yOrigin = 0.5;
        let x = resource.x //?? 0;
        let y = resource.y //?? 0;
        // Centrar posición (objetos Tiled son top-left; sprite con origin 0.5 lo centra)
        //super(scene.matter.world, resource.x,resource.y, 'resources', tipo);
        let dropsProp = props.find(p => p.name === 'drops')?.value;
        if (!dropsProp && resource.gid && scene.map) {
            const tileset = scene.map.tilesets.find(ts => resource.gid >= ts.firstgid);
            if (tileset) {
                const tileId = resource.gid - tileset.firstgid;
                const tileProps = tileset.tileProperties?.[tileId] ?? {};
                dropsProp = tileProps.drops;
            }
        }
        let drops = [];
        if (typeof dropsProp === 'string') {
            try {
                drops = JSON.parse(dropsProp);
            } catch (e) {
                console.warn(`Drops inválidos para ${drops.name}:`, dropsProp);
            }
        }
        let depth = props.find(p => p.name === 'depth')?.value;
        if (depth === undefined && resource.gid && scene.map) {
            const tileset = scene.map.tilesets.find(ts => resource.gid >= ts.firstgid);
            if (tileset) {
                const tileId = resource.gid - tileset.firstgid;
                const tileProps = tileset.tileProperties?.[tileId] ?? {};
                depth = tileProps.depth;
            }
        }

        super({ scene, x: resource.x, y: resource.y, texture: 'resources', frame: tipo, drops, depth, health: 5, name: tipo })
        // aplicar origen (visual anchor)
        this.setOrigin(0.5, yOrigin);
        const { Body, Bodies } = Phaser.Physics.Matter.Matter;
        const radius = 12;

        // crear body compuesto relativo al sprite (partes en coordenadas locales)
        const anchor = Bodies.circle(0, 0, 1, { isSensor: true, label: 'anchor' });
        const partCollider = Bodies.circle(0, 0, radius, { isSensor: false, label: 'collider' });

        const compound = Body.create({
            parts: [anchor, partCollider],
            isStatic: true
        });

        this.setExistingBody(compound);
        this.setStatic(true);
        this.setPosition(x, y);
    }






}// end class resource export