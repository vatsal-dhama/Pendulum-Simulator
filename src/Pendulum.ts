import * as THREE from 'three';
import { dynamiccamera } from '.';
export class Pendulum
{
    pendulum: THREE.Object3D<THREE.Event>; 
    origin: any
    gravity:any
    theta:any
    speed : any
    plen : any
    time :any
    wo : any
    boundingbox: THREE.Sphere;
    normalbox : THREE.Sphere;
    bob_x:any;
    bob_y:any;
    bob_z:any;
    sphere:any;
	constructor(x,y,z) 
	{
       //bob
       this.wo = Math.PI/2
        this.time = 0
       this.gravity = 9.8
       this.theta = 0;
       this.speed= 0
       const radius = 50
       this.sphere = new THREE.Mesh( 
           new THREE.SphereGeometry(radius, 50, 50), 
           new THREE.MeshStandardMaterial( { color: 0xff0000 } ) );
       this.sphere.position.set(x,y,z)
       this.sphere.add(dynamiccamera)
       this.sphere.castShadow = true
       dynamiccamera.position.set(0,200,0)

      
       const length = 200
       this.plen = length
       const geometry = new THREE.CylinderGeometry( 2, 2, length, 50 );
       const material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
       const rod = new THREE.Mesh( geometry, material );
       rod.position.set(this.sphere.position.x,this.sphere.position.y+length/2+radius,this.sphere.position.z)
       let Pendulum = new THREE.Object3D()
       this.origin = [rod.position.x, rod.position.y+length/2, rod.position.z]
       rod.translateX(-this.origin[0])
       rod.translateY(-this.origin[1])
       rod.translateZ(-this.origin[2])
       this.sphere.translateX(-this.origin[0])
       this.sphere.translateY(-this.origin[1])
       this.sphere.translateZ(-this.origin[2])
       Pendulum.add(rod)
       Pendulum.add(this.sphere)
       this.pendulum = Pendulum
       this.pendulum.translateX(this.origin[0])
       this.pendulum.translateY(this.origin[1])
       this.pendulum.translateZ(this.origin[2])
       this.pendulum.rotateZ(this.theta)
       this.boundingbox = new THREE.Sphere(new THREE.Vector3(x,y,z), radius)
       this.normalbox = new THREE.Sphere(new THREE.Vector3(x,y,z), radius)
       this.bob_x = x
       this.bob_y = y
       this.bob_z = z
	}
    ApplyPhysics(gravity,max_angle) {
        this.gravity = gravity
        this.wo = max_angle
    }
}
